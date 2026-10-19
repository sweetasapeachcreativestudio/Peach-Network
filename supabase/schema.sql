-- Peach Network MVP schema
create extension if not exists "pgcrypto";

create type user_role as enum ('business','creative','admin');
create type peach_level as enum ('seed','sapling','tree','blossom','root');
create type application_status as enum ('draft','submitted','under_review','approved','needs_more_work','rejected');
create type project_status as enum (
  'draft','matching','offer_sent','accepted','in_progress','waiting_on_client',
  'proof_uploaded','revisions','submitted','approved','completed',
  'cancel_requested','dispute','cancelled'
);
create type offer_status as enum ('sent','accepted','countered','declined','expired','withdrawn');
create type coin_ledger_type as enum ('issued','purchased','held','released','spent','refunded','expired','adjustment');
create type payout_status as enum ('pending','ready','approved','paid','failed','reversed');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

create table businesses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  industry text,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create table creatives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  primary_specialty text,
  city text,
  state text,
  peach_level peach_level,
  application_status application_status not null default 'draft',
  stripe_connect_account_id text,
  available_for_projects boolean not null default true,
  reliability_score numeric(5,2) not null default 100,
  created_at timestamptz not null default now()
);

create table creative_applications (
  id uuid primary key default gen_random_uuid(),
  creative_id uuid not null references creatives(id) on delete cascade,
  experience text,
  tools text,
  portfolio_url text,
  admin_notes text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id)
);

create table memberships (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  plan_name text not null,
  price_cents integer not null check(price_cents >= 0),
  monthly_coins integer not null check(monthly_coins >= 0),
  coin_cap integer not null check(coin_cap >= monthly_coins),
  stripe_subscription_id text,
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table coin_wallets (
  business_id uuid primary key references businesses(id) on delete cascade,
  available_coins integer not null default 0 check(available_coins >= 0),
  held_coins integer not null default 0 check(held_coins >= 0),
  updated_at timestamptz not null default now()
);

create table coin_ledger (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  project_id uuid,
  ledger_type coin_ledger_type not null,
  coin_delta integer not null,
  cash_value_cents integer,
  tax_cents integer not null default 0,
  stripe_payment_intent_id text,
  note text,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  title text not null,
  category text not null,
  description text,
  status project_status not null default 'draft',
  coin_amount integer not null default 0 check(coin_amount >= 0),
  due_at timestamptz,
  revision_rounds integer not null default 2 check(revision_rounds >= 0),
  assigned_creative_id uuid references creatives(id),
  waiting_on_client_since timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table coin_ledger
  add constraint coin_ledger_project_fk
  foreign key(project_id) references projects(id) on delete set null;

create table project_offers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  creative_id uuid not null references creatives(id) on delete cascade,
  status offer_status not null default 'sent',
  payout_cents integer not null check(payout_cents >= 0),
  counter_payout_cents integer,
  counter_reason text,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  creative_id uuid not null references creatives(id) on delete cascade,
  progress_percent integer not null check(progress_percent between 0 and 100),
  stage text not null,
  note text,
  evidence_path text,
  created_at timestamptz not null default now()
);

create table project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  sender_user_id uuid not null references profiles(id) on delete cascade,
  message text,
  file_path text,
  created_at timestamptz not null default now()
);

create table disputes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  opened_by uuid not null references profiles(id),
  reason text not null,
  status text not null default 'open',
  resolution text,
  coin_refund integer not null default 0,
  creative_payout_cents integer,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table creative_payouts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  creative_id uuid not null references creatives(id) on delete cascade,
  amount_cents integer not null check(amount_cents >= 0),
  status payout_status not null default 'pending',
  stripe_transfer_id text,
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table tax_transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  source_type text not null,
  source_id uuid,
  taxable boolean,
  jurisdiction text,
  tax_rate numeric(8,6),
  subtotal_cents integer not null,
  tax_cents integer not null default 0,
  stripe_tax_transaction_id text,
  created_at timestamptz not null default now()
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_projects_business on projects(business_id);
create index idx_projects_creative on projects(assigned_creative_id);
create index idx_projects_status on projects(status);
create index idx_offers_creative_status on project_offers(creative_id,status);
create index idx_updates_project on project_updates(project_id,created_at desc);
create index idx_messages_project on project_messages(project_id,created_at);
create index idx_coin_ledger_business on coin_ledger(business_id,created_at desc);
create index idx_payouts_status on creative_payouts(status);

-- Production TODO:
-- 1. Add RLS policies for every table.
-- 2. Use database functions/transactions when holding, spending or returning coins.
-- 3. Never update wallet balances directly from the browser.
-- 4. Store Stripe webhook event IDs to prevent duplicate processing.
-- 5. Configure taxability per product/service instead of assuming all transactions are taxable.

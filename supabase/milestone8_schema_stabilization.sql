-- Milestone 8B: schema stabilization before deployment.
-- Run AFTER milestone7_protection_payouts.sql.
-- This migration reconciles the original schema with later app code.

-- ---------------------------
-- PROJECT STATUS ENUM
-- ---------------------------
do $$ begin
  alter type project_status add value if not exists 'scope_review';
exception when duplicate_object then null; end $$;

do $$ begin
  alter type project_status add value if not exists 'dispute_review';
exception when duplicate_object then null; end $$;

-- ---------------------------
-- PROJECTS
-- ---------------------------
alter table projects
  add column if not exists progress_percent integer not null default 0,
  add column if not exists last_progress_at timestamptz,
  add column if not exists submitted_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists current_revision_round integer not null default 0,
  add column if not exists requires_in_person boolean not null default false,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists minimum_level peach_level,
  add column if not exists recommended_specialty text;

-- ---------------------------
-- CREATIVES
-- ---------------------------
alter table creatives
  add column if not exists secondary_specialty text,
  add column if not exists years_experience numeric(4,1),
  add column if not exists accepts_remote boolean not null default true,
  add column if not exists max_active_projects integer not null default 3;

-- ---------------------------
-- PROJECT OFFERS
-- ---------------------------
alter table project_offers
  add column if not exists match_score numeric(5,2),
  add column if not exists match_reason jsonb not null default '{}'::jsonb,
  add column if not exists parent_offer_id uuid references project_offers(id) on delete set null;

-- ---------------------------
-- PROJECT UPDATES
-- Original schema already creates this table. Add newer fields safely.
-- ---------------------------
alter table project_updates
  add column if not exists evidence_path text;

alter table project_updates
  alter column note set default '';

update project_updates set note='' where note is null;
alter table project_updates alter column note set not null;

-- ---------------------------
-- PROJECT MESSAGES
-- Reconcile original `message` with later `body` + system event API.
-- ---------------------------
alter table project_messages
  add column if not exists body text,
  add column if not exists is_system_event boolean not null default false;

update project_messages
set body=coalesce(body,message,'')
where body is null;

alter table project_messages
  alter column body set default '',
  alter column body set not null;

-- Keep legacy message column for compatibility during beta.
-- New application code writes `body`.

-- ---------------------------
-- PROJECT FILES
-- ---------------------------
create table if not exists project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  uploaded_by uuid not null references profiles(id) on delete cascade,
  update_id uuid references project_updates(id) on delete set null,
  file_kind text not null check (file_kind in ('asset','progress_evidence','proof','revision','final')),
  storage_path text not null,
  original_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists idx_project_files_project
  on project_files(project_id,created_at);

-- ---------------------------
-- REVISION REQUESTS
-- ---------------------------
create table if not exists project_revision_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  business_user_id uuid not null references profiles(id) on delete cascade,
  round_number integer not null,
  request_text text not null,
  status text not null default 'open'
    check(status in ('open','addressed','cancelled')),
  created_at timestamptz not null default now(),
  addressed_at timestamptz
);

-- ---------------------------
-- DISPUTES
-- Original schema has non-null opened_by/reason.
-- Later APIs need richer resolution fields.
-- ---------------------------
alter table disputes
  add column if not exists requested_resolution text,
  add column if not exists client_statement text,
  add column if not exists creative_statement text,
  add column if not exists resolution_type text,
  add column if not exists coins_returned integer not null default 0,
  add column if not exists payout_cents_awarded integer not null default 0,
  add column if not exists resolved_by uuid references profiles(id),
  add column if not exists resolved_at timestamptz;

create unique index if not exists uniq_project_open_dispute
  on disputes(project_id)
  where status in ('open','under_review');

-- ---------------------------
-- PAYOUTS
-- ---------------------------
alter table creative_payouts
  add column if not exists failure_reason text,
  add column if not exists processed_at timestamptz;

-- ---------------------------
-- NOTIFICATIONS
-- ---------------------------
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  notification_type text not null,
  title text not null,
  body text not null,
  project_id uuid references projects(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user
  on notifications(user_id,read_at,created_at desc);

-- ---------------------------
-- WEBHOOK IDEMPOTENCY / SOURCE IDEMPOTENCY
-- ---------------------------
create table if not exists stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  status text not null default 'processing',
  last_error text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table coin_ledger
  add column if not exists stripe_source_id text;

create unique index if not exists uniq_coin_ledger_stripe_source
  on coin_ledger(stripe_source_id)
  where stripe_source_id is not null;

-- ---------------------------
-- RLS HELPERS
-- ---------------------------
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1 from profiles
    where id=auth.uid() and role='admin'
  );
$$;

create or replace function is_project_participant(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1
    from projects p
    join businesses b on b.id=p.business_id
    left join creatives c on c.id=p.assigned_creative_id
    where p.id=p_project_id
      and (
        b.owner_user_id=auth.uid()
        or c.user_id=auth.uid()
        or is_admin()
      )
  );
$$;

alter table project_updates enable row level security;
alter table project_messages enable row level security;
alter table project_files enable row level security;
alter table project_revision_requests enable row level security;
alter table notifications enable row level security;

drop policy if exists "participants read project updates" on project_updates;
create policy "participants read project updates"
on project_updates for select
using (is_project_participant(project_id));

drop policy if exists "participants read project messages" on project_messages;
create policy "participants read project messages"
on project_messages for select
using (is_project_participant(project_id));

drop policy if exists "participants send project messages" on project_messages;
create policy "participants send project messages"
on project_messages for insert
with check (
  is_project_participant(project_id)
  and sender_user_id=auth.uid()
);

drop policy if exists "participants read project files" on project_files;
create policy "participants read project files"
on project_files for select
using (is_project_participant(project_id));

drop policy if exists "participants read revision requests" on project_revision_requests;
create policy "participants read revision requests"
on project_revision_requests for select
using (is_project_participant(project_id));

drop policy if exists "users read own notifications" on notifications;
create policy "users read own notifications"
on notifications for select
using (user_id=auth.uid());

drop policy if exists "users mark own notifications read" on notifications;
create policy "users mark own notifications read"
on notifications for update
using (user_id=auth.uid())
with check (user_id=auth.uid());

-- ---------------------------
-- PRIVATE STORAGE
-- ---------------------------
insert into storage.buckets(id,name,public)
values('project-files','project-files',false)
on conflict(id) do update set public=false;

drop policy if exists "project participants read storage" on storage.objects;
create policy "project participants read storage"
on storage.objects for select
using (
  bucket_id='project-files'
  and exists(
    select 1
    from project_files pf
    where pf.storage_path=name
      and is_project_participant(pf.project_id)
  )
);

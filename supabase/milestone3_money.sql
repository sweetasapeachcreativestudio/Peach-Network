-- Run AFTER schema.sql and auth_and_rls.sql

create table if not exists stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  status text not null,
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table stripe_webhook_events enable row level security;

create policy "admin webhook events"
on stripe_webhook_events for select
using (public.is_admin());

-- Prevent duplicate membership records per business/subscription.
create unique index if not exists uniq_membership_subscription
on memberships(stripe_subscription_id)
where stripe_subscription_id is not null;

-- Pack coin issuance.
-- One-time packs are capped at 10 available coins when there is no active membership.
create or replace function peach_add_pack_coins(
  p_business_id uuid,
  p_coins integer,
  p_cash_value_cents integer,
  p_tax_cents integer,
  p_stripe_payment_intent_id text,
  p_wallet_cap integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_available integer;
  v_active_membership_count integer;
  v_new_available integer;
  v_credit integer;
begin
  select available_coins into v_available
  from coin_wallets
  where business_id = p_business_id
  for update;

  if v_available is null then
    insert into coin_wallets(business_id, available_coins, held_coins)
    values (p_business_id, 0, 0)
    on conflict (business_id) do nothing;

    select available_coins into v_available
    from coin_wallets
    where business_id = p_business_id
    for update;
  end if;

  select count(*) into v_active_membership_count
  from memberships
  where business_id = p_business_id
    and status = 'active';

  if v_active_membership_count > 0 then
    v_new_available := v_available + p_coins;
  else
    v_new_available := least(v_available + p_coins, p_wallet_cap);
  end if;

  v_credit := greatest(v_new_available - v_available, 0);

  update coin_wallets
  set available_coins = v_new_available,
      updated_at = now()
  where business_id = p_business_id;

  insert into coin_ledger(
    business_id,
    ledger_type,
    coin_delta,
    cash_value_cents,
    tax_cents,
    stripe_payment_intent_id,
    note
  )
  values (
    p_business_id,
    'purchased',
    v_credit,
    p_cash_value_cents,
    p_tax_cents,
    p_stripe_payment_intent_id,
    case
      when v_credit < p_coins
      then 'Peach Pack purchased; wallet cap limited immediately available credits.'
      else 'Peach Pack purchased.'
    end
  );
end;
$$;

-- Membership refill.
-- Rollover behavior: prior available balance + monthly refill, capped at plan cap.
create or replace function peach_apply_membership_refill(
  p_business_id uuid,
  p_plan_name text,
  p_price_cents integer,
  p_monthly_coins integer,
  p_coin_cap integer,
  p_stripe_subscription_id text,
  p_period_end timestamptz,
  p_tax_cents integer,
  p_stripe_invoice_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_available integer;
  v_new_available integer;
  v_delta integer;
begin
  insert into memberships(
    business_id,
    plan_name,
    price_cents,
    monthly_coins,
    coin_cap,
    stripe_subscription_id,
    status,
    current_period_end
  )
  values (
    p_business_id,
    p_plan_name,
    p_price_cents,
    p_monthly_coins,
    p_coin_cap,
    p_stripe_subscription_id,
    'active',
    p_period_end
  )
  on conflict (stripe_subscription_id)
  do update set
    plan_name = excluded.plan_name,
    price_cents = excluded.price_cents,
    monthly_coins = excluded.monthly_coins,
    coin_cap = excluded.coin_cap,
    status = 'active',
    current_period_end = excluded.current_period_end;

  select available_coins into v_available
  from coin_wallets
  where business_id = p_business_id
  for update;

  if v_available is null then
    insert into coin_wallets(business_id, available_coins, held_coins)
    values (p_business_id, 0, 0)
    on conflict (business_id) do nothing;

    select available_coins into v_available
    from coin_wallets
    where business_id = p_business_id
    for update;
  end if;

  v_new_available := least(v_available + p_monthly_coins, p_coin_cap);
  v_delta := greatest(v_new_available - v_available, 0);

  update coin_wallets
  set available_coins = v_new_available,
      updated_at = now()
  where business_id = p_business_id;

  insert into coin_ledger(
    business_id,
    ledger_type,
    coin_delta,
    cash_value_cents,
    tax_cents,
    note
  )
  values (
    p_business_id,
    'issued',
    v_delta,
    p_price_cents,
    p_tax_cents,
    'Membership refill · ' || p_plan_name || ' · Stripe invoice ' || p_stripe_invoice_id
  );
end;
$$;

-- Trusted functions are server-side only in this MVP.
revoke all on function peach_add_pack_coins(uuid,integer,integer,integer,text,integer) from public, anon, authenticated;
revoke all on function peach_apply_membership_refill(uuid,text,integer,integer,integer,text,timestamptz,integer,text) from public, anon, authenticated;
grant execute on function peach_add_pack_coins(uuid,integer,integer,integer,text,integer) to service_role;
grant execute on function peach_apply_membership_refill(uuid,text,integer,integer,integer,text,timestamptz,integer,text) to service_role;

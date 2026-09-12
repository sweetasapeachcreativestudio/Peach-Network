-- Milestone 7: disputes, resolutions, payout execution foundation, notifications.

alter table disputes
  add column if not exists requested_resolution text,
  add column if not exists client_statement text,
  add column if not exists creative_statement text,
  add column if not exists resolution_type text,
  add column if not exists coins_returned integer not null default 0,
  add column if not exists payout_cents_awarded integer not null default 0,
  add column if not exists resolved_by uuid references profiles(id),
  add column if not exists resolved_at timestamptz;

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

alter table creative_payouts
  add column if not exists stripe_transfer_id text,
  add column if not exists failure_reason text,
  add column if not exists processed_at timestamptz;

create index if not exists idx_notifications_user on notifications(user_id,read_at,created_at desc);
create index if not exists idx_disputes_status on disputes(status,created_at);
create unique index if not exists uniq_project_open_dispute
  on disputes(project_id) where status in ('open','under_review');

alter table notifications enable row level security;
create policy "users read own notifications"
on notifications for select using (user_id=auth.uid());

create policy "users mark own notifications read"
on notifications for update using (user_id=auth.uid())
with check (user_id=auth.uid());

-- Atomic dispute resolution. Server/service role only.
create or replace function peach_resolve_dispute(
  p_dispute_id uuid,
  p_admin_user_id uuid,
  p_resolution_type text,
  p_coins_returned integer,
  p_payout_cents integer,
  p_resolution_note text
)
returns void
language plpgsql security definer set search_path=public
as $$
declare
  v_project projects%rowtype;
  v_dispute disputes%rowtype;
begin
  if p_coins_returned < 0 or p_payout_cents < 0 then
    raise exception 'Resolution values cannot be negative';
  end if;

  select * into v_dispute from disputes where id=p_dispute_id for update;
  if not found or v_dispute.status not in ('open','under_review') then
    raise exception 'Dispute is not open';
  end if;

  select * into v_project from projects where id=v_dispute.project_id for update;

  if p_coins_returned > v_project.coin_amount then
    raise exception 'Cannot return more coins than project commitment';
  end if;

  -- Remove all held coins for the project obligation.
  update coin_wallets
  set held_coins=held_coins-v_project.coin_amount,
      available_coins=available_coins+p_coins_returned,
      updated_at=now()
  where business_id=v_project.business_id
    and held_coins>=v_project.coin_amount;

  if not found then raise exception 'Held coin balance is insufficient'; end if;

  insert into coin_ledger(business_id,project_id,ledger_type,coin_delta,note)
  values(
    v_project.business_id,
    v_project.id,
    case when p_coins_returned>0 then 'released' else 'spent' end,
    p_coins_returned,
    'Peach dispute resolution: '||p_resolution_type
  );

  if p_payout_cents > 0 then
    insert into creative_payouts(project_id,creative_id,amount_cents,status,approved_by,approved_at)
    values(v_project.id,v_project.assigned_creative_id,p_payout_cents,'approved',p_admin_user_id,now());
  end if;

  update disputes
  set status='resolved',
      resolution=p_resolution_note,
      resolution_type=p_resolution_type,
      coins_returned=p_coins_returned,
      payout_cents_awarded=p_payout_cents,
      resolved_by=p_admin_user_id,
      resolved_at=now()
  where id=p_dispute_id;

  update projects
  set status=case
    when p_resolution_type='continue' then 'in_progress'
    when p_coins_returned=v_project.coin_amount then 'cancelled'
    else 'completed'
  end
  where id=v_project.id;
end $$;

revoke all on function peach_resolve_dispute(uuid,uuid,text,integer,integer,text) from public,anon,authenticated;
grant execute on function peach_resolve_dispute(uuid,uuid,text,integer,integer,text) to service_role;

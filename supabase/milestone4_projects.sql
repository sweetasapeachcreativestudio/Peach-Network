-- Milestone 4: trusted Peach Coin project controls.
-- Run after prior milestone SQL.

create or replace function peach_hold_project_coins(
  p_project_id uuid,
  p_business_id uuid,
  p_coins integer
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_available integer;
begin
  if p_coins <= 0 then raise exception 'Coin amount must be positive'; end if;

  select available_coins into v_available
  from coin_wallets where business_id=p_business_id for update;

  if v_available < p_coins then raise exception 'Not enough available Peach Coins'; end if;

  update coin_wallets
  set available_coins=available_coins-p_coins,
      held_coins=held_coins+p_coins,
      updated_at=now()
  where business_id=p_business_id;

  insert into coin_ledger(business_id,project_id,ledger_type,coin_delta,note)
  values(p_business_id,p_project_id,'held',-p_coins,'Coins held for accepted Peach project.');
end $$;

create or replace function peach_release_project_coins(
  p_project_id uuid,
  p_business_id uuid,
  p_coins integer
)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  update coin_wallets
  set available_coins=available_coins+p_coins,
      held_coins=held_coins-p_coins,
      updated_at=now()
  where business_id=p_business_id and held_coins>=p_coins;

  if not found then raise exception 'Unable to release held coins'; end if;

  insert into coin_ledger(business_id,project_id,ledger_type,coin_delta,note)
  values(p_business_id,p_project_id,'released',p_coins,'Held coins returned to Peach Wallet.');
end $$;

create or replace function peach_complete_project(
  p_project_id uuid,
  p_business_id uuid,
  p_creative_id uuid,
  p_coins integer,
  p_payout_cents integer,
  p_admin_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_payout_id uuid;
begin
  update coin_wallets
  set held_coins=held_coins-p_coins, updated_at=now()
  where business_id=p_business_id and held_coins>=p_coins;

  if not found then raise exception 'Held coin balance is insufficient'; end if;

  insert into coin_ledger(business_id,project_id,ledger_type,coin_delta,note)
  values(p_business_id,p_project_id,'spent',0,'Held Peach Coins spent on approved project.');

  update projects
  set status='completed', completed_at=now()
  where id=p_project_id;

  insert into creative_payouts(project_id,creative_id,amount_cents,status,approved_by,approved_at)
  values(p_project_id,p_creative_id,p_payout_cents,'approved',p_admin_user_id,now())
  returning id into v_payout_id;

  return v_payout_id;
end $$;

revoke all on function peach_hold_project_coins(uuid,uuid,integer) from public,anon,authenticated;
revoke all on function peach_release_project_coins(uuid,uuid,integer) from public,anon,authenticated;
revoke all on function peach_complete_project(uuid,uuid,uuid,integer,integer,uuid) from public,anon,authenticated;

grant execute on function peach_hold_project_coins(uuid,uuid,integer) to service_role;
grant execute on function peach_release_project_coins(uuid,uuid,integer) to service_role;
grant execute on function peach_complete_project(uuid,uuid,uuid,integer,integer,uuid) to service_role;

-- Run AFTER schema.sql

-- Automatically create a Peach profile after Supabase Auth signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  chosen_role user_role;
  business_name text;
begin
  chosen_role :=
    case
      when new.raw_user_meta_data->>'role' = 'creative' then 'creative'::user_role
      else 'business'::user_role
    end;

  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    chosen_role,
    new.raw_user_meta_data->>'full_name',
    new.email
  );

  if chosen_role = 'business' then
    business_name := coalesce(
      nullif(new.raw_user_meta_data->>'business_name', ''),
      'My Business'
    );

    insert into public.businesses (owner_user_id, name)
    values (new.id, business_name);

    insert into public.coin_wallets (business_id)
    select id from public.businesses where owner_user_id = new.id
    on conflict do nothing;
  else
    insert into public.creatives (user_id, application_status)
    values (new.id, 'draft')
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helpers
create or replace function public.current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from profiles where id = auth.uid()), false)
$$;

-- Enable RLS
alter table profiles enable row level security;
alter table businesses enable row level security;
alter table creatives enable row level security;
alter table creative_applications enable row level security;
alter table memberships enable row level security;
alter table coin_wallets enable row level security;
alter table coin_ledger enable row level security;
alter table projects enable row level security;
alter table project_offers enable row level security;
alter table project_updates enable row level security;
alter table project_messages enable row level security;
alter table disputes enable row level security;
alter table creative_payouts enable row level security;
alter table tax_transactions enable row level security;
alter table audit_log enable row level security;

-- Profiles
create policy "profiles read own or admin"
on profiles for select
using (id = auth.uid() or public.is_admin());

create policy "profiles update own"
on profiles for update
using (id = auth.uid())
with check (id = auth.uid());

-- Businesses
create policy "business owner read"
on businesses for select
using (owner_user_id = auth.uid() or public.is_admin());

create policy "business owner update"
on businesses for update
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

-- Creatives
create policy "creative read own or admin"
on creatives for select
using (user_id = auth.uid() or public.is_admin());

create policy "creative update own application fields"
on creatives for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Creative applications
create policy "creative application read own or admin"
on creative_applications for select
using (
  public.is_admin()
  or exists (
    select 1 from creatives c
    where c.id = creative_applications.creative_id
      and c.user_id = auth.uid()
  )
);

create policy "creative application insert own"
on creative_applications for insert
with check (
  exists (
    select 1 from creatives c
    where c.id = creative_applications.creative_id
      and c.user_id = auth.uid()
  )
);

-- Wallets / memberships / ledger
create policy "business read memberships"
on memberships for select
using (
  public.is_admin()
  or exists (
    select 1 from businesses b
    where b.id = memberships.business_id
      and b.owner_user_id = auth.uid()
  )
);

create policy "business read wallet"
on coin_wallets for select
using (
  public.is_admin()
  or exists (
    select 1 from businesses b
    where b.id = coin_wallets.business_id
      and b.owner_user_id = auth.uid()
  )
);

create policy "business read ledger"
on coin_ledger for select
using (
  public.is_admin()
  or exists (
    select 1 from businesses b
    where b.id = coin_ledger.business_id
      and b.owner_user_id = auth.uid()
  )
);

-- Projects
create policy "project participants read"
on projects for select
using (
  public.is_admin()
  or exists (
    select 1 from businesses b
    where b.id = projects.business_id
      and b.owner_user_id = auth.uid()
  )
  or exists (
    select 1 from creatives c
    where c.id = projects.assigned_creative_id
      and c.user_id = auth.uid()
  )
);

create policy "business create own projects"
on projects for insert
with check (
  exists (
    select 1 from businesses b
    where b.id = projects.business_id
      and b.owner_user_id = auth.uid()
  )
);

-- Offers
create policy "offer creative or admin read"
on project_offers for select
using (
  public.is_admin()
  or exists (
    select 1 from creatives c
    where c.id = project_offers.creative_id
      and c.user_id = auth.uid()
  )
);

-- Updates
create policy "project updates participants read"
on project_updates for select
using (
  public.is_admin()
  or exists (
    select 1 from projects p
    join businesses b on b.id = p.business_id
    where p.id = project_updates.project_id
      and b.owner_user_id = auth.uid()
  )
  or exists (
    select 1 from creatives c
    where c.id = project_updates.creative_id
      and c.user_id = auth.uid()
  )
);

create policy "creative add own updates"
on project_updates for insert
with check (
  exists (
    select 1 from creatives c
    where c.id = project_updates.creative_id
      and c.user_id = auth.uid()
  )
);

-- Messages
create policy "project message participants read"
on project_messages for select
using (
  public.is_admin()
  or exists (
    select 1 from projects p
    join businesses b on b.id = p.business_id
    where p.id = project_messages.project_id
      and b.owner_user_id = auth.uid()
  )
  or exists (
    select 1 from projects p
    join creatives c on c.id = p.assigned_creative_id
    where p.id = project_messages.project_id
      and c.user_id = auth.uid()
  )
);

create policy "project participants send messages"
on project_messages for insert
with check (
  sender_user_id = auth.uid()
  and (
    public.is_admin()
    or exists (
      select 1 from projects p
      join businesses b on b.id = p.business_id
      where p.id = project_messages.project_id
        and b.owner_user_id = auth.uid()
    )
    or exists (
      select 1 from projects p
      join creatives c on c.id = p.assigned_creative_id
      where p.id = project_messages.project_id
        and c.user_id = auth.uid()
    )
  )
);

-- Payouts
create policy "creative read own payouts"
on creative_payouts for select
using (
  public.is_admin()
  or exists (
    select 1 from creatives c
    where c.id = creative_payouts.creative_id
      and c.user_id = auth.uid()
  )
);

-- Admin-only views
create policy "admin disputes"
on disputes for all
using (public.is_admin())
with check (public.is_admin());

create policy "admin tax"
on tax_transactions for all
using (public.is_admin())
with check (public.is_admin());

create policy "admin audit"
on audit_log for all
using (public.is_admin())
with check (public.is_admin());

-- IMPORTANT:
-- Do not give the browser policies that directly change wallet balances,
-- approve payouts, or assign Peach levels. Those actions should use trusted
-- server-side functions/service-role logic with validation and audit logs.

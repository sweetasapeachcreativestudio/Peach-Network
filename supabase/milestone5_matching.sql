-- Milestone 5: Peach Match
-- Run after prior milestone SQL.

alter table creatives
  add column if not exists secondary_specialty text,
  add column if not exists years_experience numeric(4,1),
  add column if not exists accepts_remote boolean not null default true,
  add column if not exists max_active_projects integer not null default 3;

alter table projects
  add column if not exists requires_in_person boolean not null default false,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists minimum_level peach_level,
  add column if not exists recommended_specialty text;

alter table project_offers
  add column if not exists match_score numeric(5,2),
  add column if not exists match_reason jsonb not null default '{}'::jsonb,
  add column if not exists parent_offer_id uuid references project_offers(id) on delete set null;

create index if not exists idx_creatives_match_fields
  on creatives(application_status, available_for_projects, peach_level, primary_specialty);

create index if not exists idx_projects_matching
  on projects(status, recommended_specialty, minimum_level);

create index if not exists idx_offer_expiry
  on project_offers(status, expires_at);

-- Prevent the same creative from receiving duplicate live offers for the same project.
create unique index if not exists uniq_live_project_creative_offer
on project_offers(project_id, creative_id)
where status in ('sent','countered');

-- Admin/server helper: expire old offers.
create or replace function peach_expire_offers()
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare v_count integer;
begin
  update project_offers
  set status='expired'
  where status in ('sent','countered')
    and expires_at <= now();

  get diagnostics v_count = row_count;
  return v_count;
end $$;

revoke all on function peach_expire_offers() from public,anon,authenticated;
grant execute on function peach_expire_offers() to service_role;

-- Milestone 6: Project Workspace
-- Run after prior milestone SQL.

create table if not exists project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  creative_id uuid not null references creatives(id) on delete cascade,
  stage text not null check (stage in ('concept','designing','proof_ready','final_delivery')),
  progress_percent integer not null check (progress_percent between 0 and 100),
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  sender_user_id uuid not null references profiles(id) on delete cascade,
  body text not null default '',
  is_system_event boolean not null default false,
  created_at timestamptz not null default now()
);

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

create table if not exists project_revision_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  business_user_id uuid not null references profiles(id) on delete cascade,
  round_number integer not null,
  request_text text not null,
  status text not null default 'open' check (status in ('open','addressed','cancelled')),
  created_at timestamptz not null default now(),
  addressed_at timestamptz
);

alter table projects
  add column if not exists progress_percent integer not null default 0,
  add column if not exists last_progress_at timestamptz,
  add column if not exists waiting_on_client_since timestamptz,
  add column if not exists submitted_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists current_revision_round integer not null default 0;

create index if not exists idx_project_updates_project on project_updates(project_id,created_at desc);
create index if not exists idx_project_messages_project on project_messages(project_id,created_at);
create index if not exists idx_project_files_project on project_files(project_id,created_at);
create index if not exists idx_projects_deadline_watch on projects(status,due_at,last_progress_at);

alter table project_updates enable row level security;
alter table project_messages enable row level security;
alter table project_files enable row level security;
alter table project_revision_requests enable row level security;

-- Project participant helper.
create or replace function is_project_participant(p_project_id uuid)
returns boolean language sql stable security definer set search_path=public
as $$
  select exists(
    select 1
    from projects p
    left join businesses b on b.id=p.business_id
    left join creatives c on c.id=p.assigned_creative_id
    where p.id=p_project_id
      and (
        b.owner_user_id=auth.uid()
        or c.user_id=auth.uid()
        or public.is_admin()
      )
  );
$$;

create policy "participants read project updates"
on project_updates for select using (is_project_participant(project_id));

create policy "participants read project messages"
on project_messages for select using (is_project_participant(project_id));

create policy "participants send project messages"
on project_messages for insert
with check (is_project_participant(project_id) and sender_user_id=auth.uid());

create policy "participants read project files"
on project_files for select using (is_project_participant(project_id));

create policy "participants read revision requests"
on project_revision_requests for select using (is_project_participant(project_id));

-- Trusted server RPC for creative check-ins.
create or replace function peach_project_checkin(
  p_project_id uuid,
  p_creative_id uuid,
  p_stage text,
  p_progress integer,
  p_note text
)
returns uuid
language plpgsql security definer set search_path=public
as $$
declare v_update_id uuid;
begin
  if p_progress < 0 or p_progress > 100 then raise exception 'Invalid progress'; end if;

  if not exists(
    select 1 from projects
    where id=p_project_id
      and assigned_creative_id=p_creative_id
      and status in ('accepted','in_progress','waiting_on_client','proof_uploaded','revisions','submitted')
  ) then raise exception 'Project is not available for check-in'; end if;

  insert into project_updates(project_id,creative_id,stage,progress_percent,note)
  values(p_project_id,p_creative_id,p_stage,p_progress,p_note)
  returning id into v_update_id;

  update projects
  set progress_percent=p_progress,
      last_progress_at=now(),
      status=case
        when p_stage='proof_ready' then 'proof_uploaded'
        when p_stage='final_delivery' then 'submitted'
        else 'in_progress'
      end,
      submitted_at=case when p_stage='final_delivery' then now() else submitted_at end,
      waiting_on_client_since=null
  where id=p_project_id;

  return v_update_id;
end $$;

create or replace function peach_set_waiting_on_client(
  p_project_id uuid,
  p_creative_id uuid,
  p_note text
)
returns void
language plpgsql security definer set search_path=public
as $$
begin
  update projects
  set status='waiting_on_client',
      waiting_on_client_since=now()
  where id=p_project_id and assigned_creative_id=p_creative_id;

  if not found then raise exception 'Project not found'; end if;
end $$;

create or replace function peach_resume_from_client_wait(
  p_project_id uuid,
  p_business_user_id uuid
)
returns void
language plpgsql security definer set search_path=public
as $$
declare v_started timestamptz; v_delay interval;
begin
  select waiting_on_client_since into v_started
  from projects p join businesses b on b.id=p.business_id
  where p.id=p_project_id and b.owner_user_id=p_business_user_id
  for update;

  if v_started is null then raise exception 'Project is not waiting on client'; end if;
  v_delay := now()-v_started;

  update projects
  set status='in_progress',
      waiting_on_client_since=null,
      due_at=case when due_at is not null then due_at+v_delay else due_at end
  where id=p_project_id;
end $$;

revoke all on function peach_project_checkin(uuid,uuid,text,integer,text) from public,anon,authenticated;
revoke all on function peach_set_waiting_on_client(uuid,uuid,text) from public,anon,authenticated;
revoke all on function peach_resume_from_client_wait(uuid,uuid) from public,anon,authenticated;
grant execute on function peach_project_checkin(uuid,uuid,text,integer,text) to service_role;
grant execute on function peach_set_waiting_on_client(uuid,uuid,text) to service_role;
grant execute on function peach_resume_from_client_wait(uuid,uuid) to service_role;

-- Private project file bucket. Create only if absent.
insert into storage.buckets(id,name,public)
values('project-files','project-files',false)
on conflict (id) do nothing;

create policy "project participants read storage"
on storage.objects for select
using (
  bucket_id='project-files'
  and exists(
    select 1 from project_files pf
    where pf.storage_path=name and is_project_participant(pf.project_id)
  )
);

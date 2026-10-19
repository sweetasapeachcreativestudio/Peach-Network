create table public.business_brand_assets (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  kind text not null check (kind in ('logo','color','font','photo','guide','other')),
  label text not null check (length(label) between 1 and 120),
  value text,
  notes text,
  storage_path text unique,
  original_name text,
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (storage_path is not null or nullif(trim(value),'') is not null)
);
create index business_brand_assets_business_idx on public.business_brand_assets(business_id,kind);
alter table public.business_brand_assets enable row level security;
create policy "business owners manage their brand assets" on public.business_brand_assets
  for all to authenticated
  using (exists(select 1 from public.businesses b where b.id=business_id and b.owner_user_id=(select auth.uid())))
  with check (exists(select 1 from public.businesses b where b.id=business_id and b.owner_user_id=(select auth.uid())));
grant select,insert,update,delete on public.business_brand_assets to authenticated;
grant all on public.business_brand_assets to service_role;
insert into storage.buckets(id,name,public,file_size_limit)
values ('brand-vault','brand-vault',false,26214400)
on conflict (id) do nothing;
-- Files use owner-authorized signed uploads and project-authorized signed downloads.
-- No public or direct client storage policies are granted for this private bucket.

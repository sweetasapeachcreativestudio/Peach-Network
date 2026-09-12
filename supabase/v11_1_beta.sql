-- Peach Network V11.1 Beta experience + matching support
-- Additive migration designed to sit on top of the original V11 schema.

alter table profiles add column if not exists phone text;
alter table profiles add column if not exists avatar_url text;

alter table businesses add column if not exists phone text;
alter table businesses add column if not exists website text;
alter table businesses add column if not exists description text;
alter table businesses add column if not exists address_line1 text;
alter table businesses add column if not exists city text;
alter table businesses add column if not exists state text;
alter table businesses add column if not exists postal_code text;
alter table businesses add column if not exists logo_url text;
alter table businesses add column if not exists preferred_contact text;
alter table businesses add column if not exists common_needs text[] not null default '{}';

alter table creatives add column if not exists bio text;
alter table creatives add column if not exists secondary_specialties text[] not null default '{}';
alter table creatives add column if not exists tools text[] not null default '{}';
alter table creatives add column if not exists industries text[] not null default '{}';
alter table creatives add column if not exists education_level text;
alter table creatives add column if not exists education_detail text;
alter table creatives add column if not exists portfolio_url text;
alter table creatives add column if not exists availability_text text;
alter table creatives add column if not exists remote_available boolean not null default true;
alter table creatives add column if not exists service_radius_miles integer;
alter table creatives add column if not exists profile_image_url text;
alter table creatives add column if not exists mentor_name text;
alter table creatives add column if not exists mentorship_notes text;

alter table projects add column if not exists current_revision_round integer not null default 0;

create table if not exists creative_featured_work (
  id uuid primary key default gen_random_uuid(),
  creative_id uuid not null references creatives(id) on delete cascade,
  title text not null,
  description text,
  project_url text,
  image_url text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists creative_certifications (
  id uuid primary key default gen_random_uuid(),
  creative_id uuid not null references creatives(id) on delete cascade,
  title text not null,
  issuer text not null default 'Peach Academy',
  completed_at date,
  created_at timestamptz not null default now()
);

create table if not exists project_client_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  requested_by uuid not null references profiles(id) on delete cascade,
  request_type text not null default 'other',
  note text not null,
  status text not null default 'open' check(status in ('open','resolved')),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  uploaded_by uuid not null references profiles(id) on delete cascade,
  update_id uuid references project_updates(id) on delete set null,
  file_kind text not null check(file_kind in ('asset','progress_evidence','proof','revision','final')),
  storage_path text not null,
  original_name text not null,
  mime_type text,
  size_bytes bigint,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists project_revision_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  business_user_id uuid not null references profiles(id) on delete cascade,
  round_number integer not null,
  request_text text not null,
  created_at timestamptz not null default now()
);

-- Demo creatives are clearly demo-only and never receive paid offers.
create table if not exists demo_creatives (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  peach_level peach_level not null,
  headline text not null,
  city text,
  state text,
  remote_available boolean not null default true,
  specialties text[] not null default '{}',
  tools text[] not null default '{}',
  industries text[] not null default '{}',
  bio text,
  portfolio_highlights text[] not null default '{}',
  certifications text[] not null default '{}',
  education text,
  mentor_name text,
  reliability_score numeric(5,2) not null default 100,
  available_for_projects boolean not null default true,
  demo_only boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_featured_work_creative on creative_featured_work(creative_id);
create index if not exists idx_certifications_creative on creative_certifications(creative_id);
create index if not exists idx_project_files_project on project_files(project_id,created_at desc);
create index if not exists idx_client_requests_project on project_client_requests(project_id,status);
create index if not exists idx_demo_creatives_available on demo_creatives(available_for_projects);

insert into storage.buckets (id,name,public,file_size_limit)
values ('project-files','project-files',false,26214400)
on conflict (id) do update set file_size_limit=excluded.file_size_limit;

insert into storage.buckets (id,name,public,file_size_limit)
values ('profile-media','profile-media',true,8388608)
on conflict (id) do update set file_size_limit=excluded.file_size_limit;

insert into demo_creatives (name,peach_level,headline,city,state,specialties,tools,industries,bio,portfolio_highlights,certifications,education,mentor_name,reliability_score)
select * from (values
  ('Jordan Ellis','sapling'::peach_level,'Sports + Event Graphic Designer','Birmingham','AL',array['sports graphics','flyers','social media design'],array['Adobe Photoshop','Adobe Illustrator','Canva'],array['sports','events','community'], 'High-energy sports graphics, athlete announcements, tournament flyers and social content. Strong emerging portfolio with fast visual storytelling.', array['Basketball tournament flyer','Senior night athlete graphic','Youth league social campaign'], array['Peach Academy · Social Design Foundations','Peach Academy · Client Communication'], 'Graphic Design student', 'Marcus Reed · Root Creative', 96.0),
  ('Maya Brooks','blossom'::peach_level,'Brand + Campaign Designer','Atlanta','GA',array['branding','campaign design','flyers','presentations'],array['Adobe Illustrator','Adobe InDesign','Adobe Photoshop'],array['beauty','professional services','retail'], 'Experienced brand designer who turns business goals into polished campaign systems, launch graphics and print-ready collateral.', array['Beauty brand launch kit','Conference campaign','Retail seasonal promotion'], array['Peach Academy · Campaign Strategy'], 'BFA Visual Communication', null, 99.0),
  ('DeAndre King','seed'::peach_level,'Emerging Sports + Social Designer','Bessemer','AL',array['sports graphics','social media design','flyers'],array['Adobe Photoshop','Canva'],array['sports','schools','community'], 'Emerging designer with a sharp eye for bold typography, sports energy and social-first layouts. Growing quickly through coached project work.', array['Football game-day graphic','Basketball tryout flyer','Community event post'], array['Peach Academy · Design Basics'], 'High school creative pathway', 'Jordan Ellis · Sapling Creative', 94.0),
  ('Nia Carter','tree'::peach_level,'Web + Digital Experience Designer','Birmingham','AL',array['website design','landing pages','homepage refresh','UX'],array['Figma','Wix Studio','Shopify','Adobe XD'],array['beauty','food','small business'], 'Digital designer focused on attractive, easy-to-use websites that help small businesses look credible and convert visitors.', array['Beauty ecommerce homepage','Restaurant Wix refresh','Service business landing page'], array['Peach Academy · Web Experience'], 'BS Interactive Media', null, 98.0),
  ('Avery Thomas','sapling'::peach_level,'Short-Form Video + Reel Editor','Montgomery','AL',array['video editing','reels','motion graphics'],array['Adobe Premiere Pro','After Effects','CapCut'],array['food','events','personal brands'], 'Fast-paced editor specializing in vertical video, reels, event recaps and social storytelling.', array['Restaurant reel series','Wedding recap reel','Founder story edit'], array['Peach Academy · Short-Form Storytelling'], 'Media Production student', 'Camille Ross · Root Creative', 97.0),
  ('Camille Ross','root'::peach_level,'Creative Director + Mentor','Savannah','GA',array['creative direction','branding','illustration','mentorship'],array['Adobe Creative Cloud','Figma','Procreate'],array['education','nonprofit','culture','retail'], 'Senior multidisciplinary creative and mentor who supports complex visual systems and helps emerging creatives grow through real work.', array['Nonprofit rebrand','Arts festival identity','Mentored campaign team'], array['Peach Mentor Certification','Peach Academy · Advanced Client Leadership'], 'MFA Design', null, 100.0)
) as v(name,peach_level,headline,city,state,specialties,tools,industries,bio,portfolio_highlights,certifications,education,mentor_name,reliability_score)
where not exists (select 1 from demo_creatives);

-- Basic RLS for new project workspace tables. Server routes also perform participant checks.
alter table creative_featured_work enable row level security;
alter table creative_certifications enable row level security;
alter table project_client_requests enable row level security;
alter table project_files enable row level security;
alter table project_revision_requests enable row level security;
alter table demo_creatives enable row level security;

drop policy if exists demo_creatives_read on demo_creatives;
create policy demo_creatives_read on demo_creatives for select to authenticated using (true);

-- Profile-owned creative portfolio content can be read by authenticated members; writes are server-side in beta.
drop policy if exists creative_featured_work_read on creative_featured_work;
create policy creative_featured_work_read on creative_featured_work for select to authenticated using (true);
drop policy if exists creative_certifications_read on creative_certifications;
create policy creative_certifications_read on creative_certifications for select to authenticated using (true);

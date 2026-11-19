-- Admin Banner Manager & Peach Business Events / Specials
create table if not exists admin_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  desktop_image_url text not null,
  mobile_image_url text,
  cta_label text,
  cta_href text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists business_events (
  id uuid primary key default gen_random_uuid(),
  badge text not null default 'Upcoming Event',
  title text not null,
  subtitle text,
  description text not null,
  location text,
  event_date timestamptz,
  ends_at timestamptz,
  cta_label text not null default 'View Details',
  cta_href text not null default '/business/peach-business',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table admin_banners enable row level security;
alter table business_events enable row level security;

create policy "Authenticated users read active banners"
on admin_banners for select
to authenticated
using (is_active = true);

create policy "Authenticated users read active business events"
on business_events for select
to authenticated
using (is_active = true);

insert into admin_banners (title, subtitle, desktop_image_url, mobile_image_url, cta_label, cta_href, is_active, sort_order)
select
  'Welcome to the Beta Test, Business Owners!',
  'Check out Peach Business to submit feedback on anything broken or share suggestions.',
  '/assets/aistudio/Code_Generated_Image_e26f9006.png',
  '/assets/aistudio/Code_Generated_Image_e26f9006.png',
  'Go to Peach Business',
  '/business/peach-business#feedback',
  true,
  0
where not exists (
  select 1 from admin_banners where desktop_image_url = '/assets/aistudio/Code_Generated_Image_e26f9006.png'
);

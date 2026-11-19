-- Add explicit two-sided contract signature columns to projects
alter table public.projects
  add column if not exists business_signature_name text,
  add column if not exists business_signed_at timestamptz,
  add column if not exists creative_signature_name text,
  add column if not exists creative_signed_at timestamptz,
  add column if not exists signature_status text not null default 'pending';

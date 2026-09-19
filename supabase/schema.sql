create table if not exists public.institutions (
  id uuid primary key,
  name text not null,
  city text not null default 'Cúcuta',
  slug text not null unique,
  status text not null default 'active' check (status in ('active','draft','archived')),
  password_salt text not null,
  password_hash text not null,
  created_at bigint not null,
  updated_at bigint not null
);

create table if not exists public.resources (
  id uuid primary key,
  title text not null,
  description text not null default '',
  type text not null,
  category text not null default 'General',
  status text not null default 'published' check (status in ('draft','published','archived')),
  visibility text not null default 'general' check (visibility in ('general','institution')),
  institution_id uuid references public.institutions(id) on delete set null,
  version integer not null default 1,
  file_key text not null,
  file_name text not null,
  mime_type text not null,
  file_size bigint not null,
  checksum text not null default '',
  created_by text not null,
  created_at bigint not null,
  updated_at bigint not null
);

create table if not exists public.resource_versions (
  id uuid primary key,
  resource_id uuid not null references public.resources(id) on delete cascade,
  version integer not null,
  file_key text not null,
  file_name text not null,
  mime_type text not null,
  file_size bigint not null,
  checksum text not null default '',
  created_by text not null,
  created_at bigint not null,
  unique(resource_id, version)
);

create table if not exists public.access_limits (
  key text primary key,
  attempts integer not null default 0,
  window_started_at bigint not null,
  blocked_until bigint,
  updated_at bigint not null
);

create table if not exists public.backups (
  id uuid primary key,
  object_key text not null,
  status text not null default 'ready' check (status in ('ready','restored')),
  institution_count integer not null default 0,
  resource_count integer not null default 0,
  file_count integer not null default 0,
  created_by text not null,
  created_at bigint not null,
  restored_by text,
  restored_at bigint
);

create table if not exists public.audit_log (
  id uuid primary key,
  actor_email text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  detail text not null default '',
  created_at bigint not null
);

create index if not exists resources_institution_idx on public.resources(institution_id);
create index if not exists resources_status_idx on public.resources(status);
create index if not exists resource_versions_resource_idx on public.resource_versions(resource_id);
create index if not exists access_limits_updated_idx on public.access_limits(updated_at);
create index if not exists backups_created_idx on public.backups(created_at desc);
create index if not exists audit_created_idx on public.audit_log(created_at desc);

alter table public.institutions enable row level security;
alter table public.resources enable row level security;
alter table public.resource_versions enable row level security;
alter table public.access_limits enable row level security;
alter table public.backups enable row level security;
alter table public.audit_log enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hub-documents', 'hub-documents', false, 26214400,
  array['application/pdf','image/png','image/jpeg','image/webp','application/vnd.openxmlformats-officedocument.presentationml.presentation'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

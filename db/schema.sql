-- Infectonorte HUB — esquema Supabase (Postgres)
-- Ver docs/00-estrategia-arquitectura.md sección 8 para el razonamiento de diseño.
-- Este archivo es la migración de referencia para pasar de la capa demo
-- (data/*.ts) a Supabase real. No se ejecuta automáticamente en este MVP.

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- búsqueda tolerante a errores

-- ── Enums ────────────────────────────────────────────────────────────────
create type resource_type as enum (
  'algoritmo','protocolo','guia','infografia','presentacion','grafica',
  'dashboard','video','pdf','documento','enlace','herramienta'
);

create type resource_status as enum (
  'vigente','proximo_revision','en_revision','vencido','archivado','borrador'
);

create type resource_visibility as enum (
  'publico','general_infectonorte','instituciones_seleccionadas','exclusivo'
);

create type taxonomy_kind as enum ('tipo','area','sindrome','poblacion');
create type author_role as enum ('autor','revisor');
create type access_method as enum ('shared_password','magic_link','email_password');
create type admin_role as enum ('superadmin','editor');
create type request_status as enum ('nueva','agrupada','en_desarrollo','publicada','descartada');
create type analytics_event_type as enum ('view','download','search','search_no_results');

-- ── Instituciones ────────────────────────────────────────────────────────
create table institutions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  city text not null,
  department text not null,
  logo_url text,
  status text not null default 'activa' check (status in ('activa','inactiva')),
  contact_email text,
  contact_phone text,
  services text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Separada de `institutions` a propósito: es el punto de evolución hacia
-- cuentas individuales / magic link / SSO sin migrar el esquema.
create table institution_access (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references institutions(id) on delete cascade,
  method access_method not null default 'shared_password',
  password_hash text not null,
  updated_at timestamptz not null default now(),
  unique (institution_id, method)
);

create table administrators (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  role admin_role not null default 'editor',
  name text not null,
  created_at timestamptz not null default now()
);

-- ── Taxonomía y etiquetas ────────────────────────────────────────────────
create table taxonomy_terms (
  id uuid primary key default gen_random_uuid(),
  taxonomy taxonomy_kind not null,
  label text not null,
  slug text not null,
  unique (taxonomy, slug)
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  slug text unique not null
);

create table authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  credentials text,
  institution_id uuid references institutions(id) on delete set null
);

-- ── Recursos ─────────────────────────────────────────────────────────────
create table resources (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text not null default '',
  description text not null default '',
  key_points text[] not null default '{}',
  type resource_type not null,
  status resource_status not null default 'borrador',
  visibility resource_visibility not null default 'general_infectonorte',
  owner_institution_id uuid references institutions(id) on delete set null,
  parent_resource_id uuid references resources(id) on delete set null,
  cover_image text,
  file_url text,
  version text not null default '1.0',
  published_at timestamptz,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Columna generada para full-text search en español (título + resumen + descripción).
  search_vector tsvector generated always as (
    setweight(to_tsvector('spanish', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(description, '')), 'C')
  ) stored
);

create index resources_search_idx on resources using gin (search_vector);
create index resources_title_trgm_idx on resources using gin (title gin_trgm_ops);
create index resources_visibility_idx on resources (visibility);
create index resources_owner_institution_idx on resources (owner_institution_id);

create table resource_versions (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references resources(id) on delete cascade,
  version_label text not null,
  file_url text not null,
  changelog text not null default '',
  created_by uuid references administrators(id),
  created_at timestamptz not null default now()
);

create table presentation_details (
  resource_id uuid primary key references resources(id) on delete cascade,
  speaker text not null,
  event text not null,
  session_date date not null,
  video_url text
);

create table resource_taxonomy_terms (
  resource_id uuid not null references resources(id) on delete cascade,
  term_id uuid not null references taxonomy_terms(id) on delete cascade,
  primary key (resource_id, term_id)
);

create table resource_tags (
  resource_id uuid not null references resources(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (resource_id, tag_id)
);

create table resource_authors (
  resource_id uuid not null references resources(id) on delete cascade,
  author_id uuid not null references authors(id) on delete cascade,
  role author_role not null default 'autor',
  primary key (resource_id, author_id, role)
);

-- Solo se usa cuando resources.visibility = 'instituciones_seleccionadas'.
create table institution_resources (
  institution_id uuid not null references institutions(id) on delete cascade,
  resource_id uuid not null references resources(id) on delete cascade,
  granted_at timestamptz not null default now(),
  primary key (institution_id, resource_id)
);

-- ── Analítica (sin PII, sin datos de pacientes) ─────────────────────────
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type analytics_event_type not null,
  resource_id uuid references resources(id) on delete set null,
  institution_id uuid references institutions(id) on delete set null,
  query_text text,
  session_hash text, -- hash anónimo de dispositivo/sesión, nunca un identificador de usuario
  created_at timestamptz not null default now()
);

create index analytics_events_created_idx on analytics_events (created_at desc);

create table content_requests (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  description text not null,
  institution_id uuid references institutions(id) on delete set null,
  requester_contact text,
  status request_status not null default 'nueva',
  count integer not null default 1,
  created_at timestamptz not null default now()
);

-- ── Row Level Security ───────────────────────────────────────────────────
-- Principio: el frontend nunca decide qué es visible. Toda fila de `resources`
-- pasa por estas políticas sin importar qué pida el cliente.
alter table resources enable row level security;
alter table institution_resources enable row level security;
alter table institution_access enable row level security;
alter table administrators enable row level security;
alter table analytics_events enable row level security;

-- Lectura pública: solo contenido publico o general_infectonorte con estado
-- que no sea borrador/archivado.
create policy resources_public_read on resources
  for select
  using (
    visibility in ('publico', 'general_infectonorte')
    and status not in ('borrador', 'archivado')
  );

-- Lectura institucional: requiere que el JWT de sesión (claim `institution_id`,
-- inyectado por la capa de autenticación de la app) coincida con el dueño del
-- recurso, o que exista una fila en institution_resources para esa institución.
-- request.jwt.claims lo puebla Supabase Auth; mientras se use el JWT propio
-- (ver lib/auth.ts) esta política se aplica desde una vista/RPC con
-- SECURITY DEFINER que valida el JWT en el servidor antes de consultar.
create policy resources_institution_read on resources
  for select
  using (
    visibility = 'exclusivo'
    and owner_institution_id::text = current_setting('request.jwt.claims', true)::json->>'institution_id'
  );

create policy resources_institution_shared_read on resources
  for select
  using (
    visibility = 'instituciones_seleccionadas'
    and exists (
      select 1 from institution_resources ir
      where ir.resource_id = resources.id
        and ir.institution_id::text = current_setting('request.jwt.claims', true)::json->>'institution_id'
    )
  );

-- Escritura de contenido: solo administradores (verificado vía función
-- is_admin(), que valida el rol en el JWT de Supabase Auth del backoffice).
create policy resources_admin_write on resources
  for all
  using (current_setting('request.jwt.claims', true)::json->>'role' = 'admin_service')
  with check (current_setting('request.jwt.claims', true)::json->>'role' = 'admin_service');

-- institution_access y administrators nunca son legibles desde el cliente:
-- solo el backend (rol de servicio) puede leer/escribir contraseñas hasheadas.
create policy institution_access_service_only on institution_access
  for all using (false) with check (false);

create policy administrators_service_only on administrators
  for all using (false) with check (false);

-- analytics_events: inserción abierta desde el backend de la app (nunca desde
-- el cliente directamente), lectura solo para administradores.
create policy analytics_events_admin_read on analytics_events
  for select
  using (current_setting('request.jwt.claims', true)::json->>'role' = 'admin_service');

create policy analytics_events_service_insert on analytics_events
  for insert
  with check (current_setting('request.jwt.claims', true)::json->>'role' = 'admin_service');

-- NOTA IMPORTANTE: mientras la sesión institucional use el JWT propio descrito
-- en lib/auth.ts (no Supabase Auth), las consultas a `resources` desde el
-- portal institucional pasan por una Route Handler de Next.js que usa la
-- service_role key de Supabase (bypass de RLS) y aplica el filtro de
-- visibilidad en código de servidor — exactamente como hace hoy
-- data/resources.ts → getResourcesForInstitution(). Las políticas de RLS de
-- arriba quedan listas para el día en que la sesión institucional migre a
-- Supabase Auth con JWT verificado nativamente por Postgres.

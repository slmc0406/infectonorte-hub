import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

const text = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("usa Next.js estándar para Render", async () => {
  const pkg = JSON.parse(await text("package.json"));
  assert.equal(pkg.scripts.build, "next build");
  assert.equal(pkg.scripts.start, "next start");
  assert.ok(pkg.dependencies["@supabase/supabase-js"]);
  assert.equal(pkg.dependencies.vinext, undefined);
});

test("incluye Blueprint de Render", async () => {
  const render = await text("render.yaml");
  assert.match(render, /npm ci && npm run build/);
  assert.match(render, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(render, /SUPABASE_SERVICE_ROLE_KEY/);
});

test("incluye esquema persistente y almacenamiento privado", async () => {
  const schema = await text("supabase/schema.sql");
  for (const table of ["institutions", "resources", "resource_versions", "access_limits", "backups", "audit_log"]) assert.match(schema, new RegExp(`table if not exists public\\.${table}`));
  assert.match(schema, /'hub-documents', 'hub-documents', false/);
  assert.match(schema, /enable row level security/g);
});

test("incluye acceso administrativo propio", async () => {
  const login = await text("app/api/admin-login/route.ts");
  assert.match(login, /hub_admin_session/);
  assert.match(login, /httpOnly: true/);
  assert.match(login, /evaluateAccessLimit/);
  await access(new URL("../app/admin/login/page.tsx", import.meta.url));
});

test("mantiene protección institucional y archivos privados", async () => {
  const login = await text("app/api/institution-login/route.ts");
  const resource = await text("app/api/resources/[id]/route.ts");
  assert.match(login, /verifyPassword/);
  assert.match(login, /hub_institution_session/);
  assert.match(resource, /readInstitutionSession/);
  assert.match(resource, /downloadStoredFile/);
});

test("conserva las tres marcas institucionales", async () => {
  for (const asset of ["public/brand/infectonorte.svg", "public/brand/infectoped.svg", "public/brand/familias-con-vacunas-transparent.png"]) await access(new URL(`../${asset}`, import.meta.url));
  const brand = await text("components/brand.tsx");
  assert.match(brand, /Familias con Vacunas/);
});

test("documenta configuración sin incluir secretos reales", async () => {
  const env = await text(".env.example");
  const readme = await text("README.md");
  assert.match(env, /SUPABASE_SERVICE_ROLE_KEY=/);
  assert.doesNotMatch(env, /eyJ[a-zA-Z0-9_-]{20,}/);
  assert.match(readme, /No subas `.env.local`/);
});

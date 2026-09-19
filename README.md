# Infectonorte HUB — MVP

Plataforma centralizada de conocimiento clínico de Infectonorte. Este repositorio
contiene el MVP funcional descrito en `docs/00-estrategia-arquitectura.md`.

## Empezar

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Abrir http://localhost:3000

## Credenciales demo

- **Portal institucional** (Clínica Demo del Norte): `/i/clinica-demo-norte` → contraseña `demo1234`
- **Panel administrativo**: `/admin` → `admin@infectonorte.com` / `admin1234`

## Estado de los datos

Todo el contenido vive en `data/*.ts` como una capa de datos tipada que refleja
exactamente el modelo de `db/schema.sql`. Es intencional: permite navegar,
buscar, autenticarse y administrar contenido de verdad en este MVP sin una
base de datos, y migrar a Supabase reemplazando solo esa capa (`data/` →
consultas a Supabase), sin tocar componentes ni páginas.

Las mutaciones del panel admin (crear institución, crear contenido, cambiar
contraseña, etc.) modifican esos arreglos en memoria del proceso de Node —
persisten mientras el servidor esté corriendo, pero se reinician si el
servidor se reinicia. Ver sección 6 del documento de estrategia para el plan
de conexión real a Supabase (V2).

## Estructura

```
app/                    Rutas (App Router de Next.js)
  [tipo]/[slug]/         Ficha de recurso pública (unifica /algoritmos, /academia, etc.)
  biblioteca/, buscar/   Biblioteca general y resultados de búsqueda
  i/[slug]/              Login institucional + portal (/portal, /portal/biblioteca)
  admin/                 Panel administrativo (instituciones, contenido, solicitudes, analítica)
  api/                   Route Handlers (sesión institucional/admin, búsqueda, contenido)
components/             Componentes de UI y de producto
data/                   Capa de datos demo (tipada según db/schema.sql)
db/schema.sql           Migración de referencia para Supabase (con RLS)
docs/                   Documento de estrategia y arquitectura completo
lib/                    Auth, sesión, búsqueda, utilidades
```

## Seguridad implementada en este MVP

- Contraseñas institucionales y de administrador hasheadas con bcrypt (nunca texto plano).
- Sesiones firmadas con JWT (`jose`), cookies `httpOnly` + `secure` en producción.
- Autorización verificada del lado del servidor en cada página y ruta de API
  (nunca solo en el middleware ni en el cliente).
- Rate limiting de intentos de login (institucional y admin).
- Aislamiento entre instituciones: el portal de una institución solo puede
  ver su propio contenido exclusivo, verificado en el servidor por `institution_id`.
- `robots.txt` y metadata `noindex` en todo lo bajo `/i/` y `/admin`.

## Próximos pasos (V2)

Ver sección 11 de `docs/00-estrategia-arquitectura.md`: conexión real a
Supabase (Auth + Storage + RLS en producción), generación y descarga real de
QR ya implementada (`qrcode`), analítica persistente, PWA básica.

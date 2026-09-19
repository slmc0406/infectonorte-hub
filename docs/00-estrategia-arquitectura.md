# Infectonorte HUB — Documento de Estrategia y Arquitectura

Versión 1.0 · 27 de agosto de 2026

Este documento cubre las Fases 1 a 4 solicitadas (Discovery, Arquitectura, UX, sistema de diseño) antes de pasar a construcción. Las decisiones menores ya están tomadas con criterio profesional; las decisiones estructurales están marcadas explícitamente como **[DECISIÓN QUE REQUIERE TU CONFIRMACIÓN]**.

---

## 1. Interpretación del producto

Infectonorte HUB no es un repositorio de documentos: es **infraestructura de decisión clínica en el punto de atención**. El usuario objetivo es un médico o enfermera de turno, con el teléfono en una mano y un paciente enfrente, que necesita pasar de "escaneo de QR" a "conducta clínica correcta" en menos de 20 segundos. Todo el producto se diseña hacia atrás desde ese momento: velocidad de carga, jerarquía de información, y un buscador que nunca falle son más importantes que cualquier función administrativa.

El segundo usuario, menos frecuente pero igual de importante, es el equipo de Infectonorte (editores clínicos) que publica y mantiene el conocimiento. Si publicar o corregir un algoritmo requiere un desarrollador, el producto fallará operativamente sin importar qué tan bien se vea. Por eso el panel administrativo tiene la misma prioridad de diseño que la biblioteca pública.

El tercer usuario es la institución (director médico, referente PROA/PCI) que quiere ver, de un vistazo, el estado de su conocimiento clínico vigente — de ahí el "Command Center" institucional.

**Multi-tenancy con aislamiento estricto** es el requisito no negociable: una institución nunca debe poder ver contenido exclusivo de otra, ni por URL, ni por API, ni por buscador. Esto se resuelve en el servidor (RLS + verificación de sesión), nunca en el cliente.

---

## 2. Qué mejoraría de la propuesta original

- **Buscador**: el brief pide "buscador básico primero, semántico después". Mi recomendación es construir desde el MVP un buscador de **texto completo en Postgres (tsvector + pg_trgm)** con tolerancia a errores ortográficos real, en vez de un `LIKE %texto%`. Es la misma inversión de esfuerzo, pero evita reconstruir el buscador en V2. Búsqueda semántica (embeddings) queda para V3, como pediste.
- **Taxonomía**: en lugar de tablas separadas para "población", "síndrome", "área", "tipo" (como sugiere el punto 27), uso una sola tabla `taxonomy_terms` con un campo `taxonomy` discriminador. Menos tablas, mismo resultado, más fácil agregar una quinta categoría en el futuro sin migraciones.
- **Presentaciones (Academia)**: no las modelo como entidad separada; son un `resource` de tipo `presentacion` con una tabla de extensión `presentation_details` (ponente, evento, fecha de sesión). Evita duplicar todo el sistema de versiones/tags/visibilidad que ya tienen los demás recursos.
- **Adaptaciones institucionales**: se resuelven con una auto-referencia `parent_resource_id` en `resources`, no con una entidad nueva. "Antibiograma UCI Clínica X" apunta a "Antibiograma general Infectonorte" como padre.
- **Autenticación institucional**: modelo `institution_access` como tabla independiente de `institutions` desde el día uno (aunque hoy solo tenga una contraseña compartida). Esto es lo que permite evolucionar a cuentas individuales/magic link/SSO sin rediseñar el esquema — es exactamente la previsión que pediste en el punto 8.
- **QR**: no debe regenerarse nunca al cambiar la contraseña (correcto en tu brief); lo refuerzo generando el QR como un recurso versionado y cacheable en Storage, no bajo demanda en cada click.

## 3. Qué eliminaría o pospondría del alcance de MVP

Para proteger el criterio de "20 segundos", el MVP **no** incluye (quedan en V2/V3, arquitectura preparada pero sin construir):

- Dashboards epidemiológicos y antibiogramas interactivos con datos reales (se deja el modelo de datos y un componente de gráfica de ejemplo con datos demo).
- Favoritos sincronizados a usuarios individuales (V1: local en el dispositivo vía `localStorage`, como pediste).
- Búsqueda semántica / asistente clínico con IA.
- Notificaciones push/email de actualizaciones.
- Roles institucionales granulares (V1: un solo nivel de acceso por institución).
- Hosting propio de video (V1: embed privado de YouTube/Vimeo no listado, o Supabase Storage con URL firmada para clips cortos).

## 4. Qué faltaba en el brief y agrego

- **Aviso legal / disclaimer clínico** visible en cada recurso y en el footer: uso previsto, responsabilidad profesional, contenido demo claramente marcado.
- **`robots.txt` / meta `noindex`** explícito para todo lo bajo `/i/` y `/admin` — el brief pide URLs amigables para la biblioteca pero no menciona bloquear indexación de lo privado, y es crítico.
- **Auditoría de acciones administrativas** (quién publicó/editó/desactivó qué y cuándo) — necesario en un producto clínico, aunque no se pidió explícitamente.
- **Rate limiting y bloqueo temporal** tras intentos fallidos de login institucional, con mensaje que no confirma si la institución existe.
- **Estados vacíos, de carga y de error** diseñados explícitamente (buscador sin resultados, institución sin contenido nuevo, etc.) — parte de tu propio checklist de QA, los diseño desde ya.
- **Estrategia de backup** de Storage y base de datos (Supabase lo da por defecto en point-in-time recovery en planes pagos; lo documento como requisito de configuración, no de código).

---

## 5. Arquitectura funcional

Tres superficies, un solo backend, aislamiento por RLS:

1. **Biblioteca General** (`/`, `/biblioteca`, `/algoritmos/[slug]`, etc.) — pública, indexable, sin login.
2. **Portal institucional** (`/i/[slug]`) — requiere sesión institucional; contenido = general Infectonorte + instituciones-seleccionadas (si aplica) + exclusivo de esa institución.
3. **Admin central** (`/admin`) — requiere sesión de administrador Infectonorte; CRUD de instituciones, contenido, solicitudes, analítica.

Un mismo `resource` puede aparecer en las tres superficies según su `visibility`; nunca se duplica el archivo.

## 6. Arquitectura técnica

**Confirmo tu propuesta con ajustes**, evaluada contra las prioridades que diste (seguridad, bajo mantenimiento, escalabilidad, facilidad administrativa, costo, rendimiento, velocidad de desarrollo):

| Capa | Elección | Por qué |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + React Server Components | SEO nativo para biblioteca pública, rutas privadas server-protected, un solo repo full-stack |
| Estilos | Tailwind CSS + sistema de tokens propio (ver sección 10) | Consistencia rápida sin CSS a medida |
| Backend/DB | Supabase (Postgres + Storage + Auth + RLS) | RLS a nivel de fila es exactamente lo que necesita el aislamiento multi-institución; Auth listo para la evolución a cuentas individuales; Storage con URLs firmadas para PDFs privados |
| Búsqueda | Postgres `tsvector` + `pg_trgm`, sin motor externo | Suficiente hasta varios cientos de miles de recursos; cero costo/infra adicional |
| Hosting | Vercel (frontend) + Supabase Cloud (datos/storage) | Bajo mantenimiento, autoescalado, CDN de imágenes incluido |
| Sesión institucional | JWT propio firmado (httpOnly cookie), no Supabase Auth todavía | Hoy no hay usuarios individuales por institución; un JWT simple con `institution_id` + expiración es más simple y igual de seguro, y migra a Supabase Auth sin romper nada cuando haya cuentas individuales |

**Alternativas evaluadas y descartadas**: Cloudflare Pages + D1 (SQLite) — descartado porque D1 aún no iguala la madurez de RLS de Postgres para aislamiento multi-tenant, que es el requisito de seguridad más crítico del producto. Firebase/Firestore — descartado porque un modelo documental complica el modelo relacional rico que pide el punto 27 (versiones, taxonomías, relaciones). Backend a medida (Node + Postgres autogestionado) — descartado por mantenimiento operativo más alto sin beneficio claro a esta escala.

**Decisión estructural importante — [DECISIÓN QUE REQUIERE TU CONFIRMACIÓN]**: uso Supabase en el plan Pro (no el free tier) en producción, porque el free tier pausa proyectos inactivos y tiene backups limitados — inaceptable para un sistema que un médico puede necesitar a las 3 a.m. Esto tiene costo mensual (~US$25 base + storage/egress). Lo señalo porque afecta el punto 5 de tus prioridades (costos).

## 7. Mapa del sitio

```
/                                  Home pública
/biblioteca                        Listado + filtros
/biblioteca?tipo=algoritmo&...      Filtros vía query params (compartibles)
/buscar?q=...                       Resultados de búsqueda
/algoritmos/[slug]                  Ficha de recurso (patrón repetido por tipo o unificado en /r/[slug])
/academia                           Biblioteca de presentaciones
/academia/[slug]                    Ficha de presentación
/i/[slug]                           Login institucional
/i/[slug]/portal                    Home institucional (post-login)
/i/[slug]/portal/biblioteca         Biblioteca institucional (general + exclusiva)
/i/[slug]/portal/r/[slug]           Ficha de recurso en contexto institucional
/solicitar-contenido                Formulario de solicitud
/admin                              Login administrador
/admin/instituciones                Listado + gestión
/admin/instituciones/nueva           Alta de institución
/admin/instituciones/[id]            Detalle/edición/QR
/admin/contenido                     Listado + gestión de recursos
/admin/contenido/nuevo                Alta de recurso (borrador → publicar)
/admin/contenido/[id]                 Edición/versionado
/admin/solicitudes                    Solicitudes de contenido agrupadas
/admin/analitica                      Contenido más consultado, búsquedas sin resultado, etc.
```

Todo bajo `/i/` y `/admin` lleva `noindex, nofollow`.

## 8. Modelo de datos (MVP)

Entidades principales y relaciones clave (nombres de tabla en `snake_case`, PK `uuid`):

- **institutions** — slug, name, city, department, logo_url, status, contact info.
- **institution_access** — institution_id → institutions, method (`shared_password` | `magic_link` | `email_password`, hoy solo el primero), password_hash (bcrypt), updated_at. *Separada de `institutions` a propósito: es el punto de evolución hacia auth individual.*
- **administrators** — email, password_hash, role (`superadmin` | `editor`).
- **resources** — slug, title, summary, description, type (enum: algoritmo, protocolo, guía, infografía, presentación, gráfica, dashboard, video, pdf, documento, enlace, herramienta), status (vigente, próximo a revisión, en revisión, vencido, archivado, borrador), visibility (público, general_infectonorte, instituciones_seleccionadas, exclusivo), owner_institution_id (nullable, para exclusivo), parent_resource_id (nullable, autorreferencia para adaptaciones), published_at, last_reviewed_at, next_review_at.
- **resource_versions** — resource_id, version_label, file_url, changelog, created_by, created_at. Historial completo.
- **presentation_details** — resource_id (1:1), speaker, event, session_date. Extiende `resources` cuando `type = presentacion`.
- **taxonomy_terms** — taxonomy (`tipo` | `area` | `sindrome` | `poblacion`), label, slug.
- **resource_taxonomy_terms** — resource_id, term_id. Join N:N.
- **tags** — label, slug (microorganismos, antimicrobianos, libres).
- **resource_tags** — resource_id, tag_id.
- **authors** — name, credentials.
- **resource_authors** — resource_id, author_id, role (`autor` | `revisor`).
- **institution_resources** — institution_id, resource_id, granted_at. Solo se usa cuando `visibility = instituciones_seleccionadas`.
- **analytics_events** — event_type (`view` | `download` | `search` | `search_no_results`), resource_id (nullable), institution_id (nullable), query_text (nullable), session_hash (anónimo, sin PII), created_at.
- **content_requests** — topic, institution_id (nullable), description, status (`nueva` | `agrupada` | `en_desarrollo` | `publicada` | `descartada`), created_at.

Todas las tablas con datos institucionales tienen RLS activado; las políticas se documentan en `db/schema.sql` (ver Fase 5).

## 9. Flujo de QR y acceso institucional

1. Admin crea la institución → sistema genera slug único → genera QR apuntando a `https://hub.infectonorte.com/i/[slug]` (URL estable, **nunca** contiene contraseña ni token).
2. Usuario escanea el QR en el hospital → llega a `/i/[slug]` → ve `Infectonorte HUB × [Institución]` con logo, y el campo "Contraseña institucional".
3. Submit → `POST /api/institutions/[slug]/session` → el servidor: (a) aplica rate limiting por IP+slug, (b) busca `institution_access` por slug, (c) compara hash con bcrypt, (d) si es válido, firma un JWT (`institution_id`, `exp` 8–12h) y lo setea como cookie `httpOnly`, `secure`, `sameSite=lax`.
4. Toda ruta y API bajo `/i/[slug]/portal/**` valida en el servidor que el JWT de la cookie corresponde al `institution_id` del slug solicitado — si no coincide, 404 (no 403, para no confirmar existencia).
5. Cambiar la contraseña institucional solo actualiza `institution_access.password_hash`; el QR nunca se regenera ni se invalida.

## 10. Sistema de diseño (resumen — detalle técnico en `design-system/tokens.md`)

**Nota importante — [DECISIÓN QUE REQUIERE TU CONFIRMACIÓN]**: no recibí en esta sesión logos ni archivos de marca de Infectonorte. Para poder avanzar sin detener la construcción, definí una paleta placeholder de nivel profesional ("Clinical Premium": azul-verdoso profundo como color primario, casi-negro para texto, blanco roto para fondo, un acento cálido para estados). En cuanto compartas los archivos de marca reales, se reemplazan los tokens de color/tipografía en un solo lugar (`tailwind.config.ts` + `globals.css`) sin tocar componentes.

- **Color**: primario `#0F5C5C` (teal profundo), texto `#0B1220`, fondo `#FAFAF9`, acento `#D9822B` (ámbar clínico, uso limitado a estados/CTA), semánticos de estado (vigente/verde, próximo a revisión/ámbar, vencido/rojo, borrador/gris).
- **Tipografía**: una sans-serif geométrica para títulos (Inter/Söhne-like) y la misma familia en texto — evita cargar dos fuentes en móvil.
- **Espaciado/radios**: escala de 4px; radios 8/12/16px (cards más redondeadas que inputs).
- **Sombras**: muy sutiles, solo para modales y elementos flotantes — nunca en cards de listado (mantiene el 70% "Clinical Premium").
- **Componentes**: Button (primary/secondary/ghost/destructive), Badge de estado, Card de recurso, Input con label flotante, Modal, Tabs, Nav inferior móvil + sidebar desktop, Skeleton de carga.

---

## 11. Roadmap

**MVP (esta sesión)**: biblioteca general con datos demo, buscador funcional, ficha de recurso completa, una institución piloto con login y portal, command center básico, panel admin funcional (CRUD instituciones y contenido sobre datos demo), esquema SQL de Supabase listo para conectar.

**V2**: conexión real a Supabase (Auth + Storage + RLS en producción), carga real de PDFs/imágenes, generación real de QR descargable, analítica real, solicitudes de contenido, adaptaciones institucionales visibles, PWA básica (cacheo de recursos vistos).

**V3**: cuentas individuales por institución, roles y permisos, dashboards epidemiológicos y antibiogramas interactivos con datos reales, notificaciones, favoritos sincronizados, integraciones externas, búsqueda semántica y asistente clínico basado solo en contenido aprobado.

---

## 12. Los tres criterios de éxito (autoevaluación continua)

Cada pantalla construida en este MVP se valida contra: (1) ¿un médico llega del QR al algoritmo en <20s?, (2) ¿se siente como herramienta profesional de una organización especializada, no como repositorio de archivos?, (3) ¿una persona no técnica puede operar el admin sin tocar código? Estos tres criterios gobiernan cada decisión de UI tomada durante la construcción.

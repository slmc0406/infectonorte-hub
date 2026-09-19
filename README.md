# Infectonorte HUB — Render + Supabase

Versión de producción de Infectonorte HUB adaptada para ejecutarse como aplicación Node.js en Render, con datos y archivos persistentes en Supabase.

## Incluye

- Biblioteca clínica pública y buscador.
- Portales institucionales protegidos por contraseña.
- Panel administrativo propio en `/admin`.
- Instituciones, estados editoriales y visibilidad por institución.
- Carga privada de PDF, imágenes y presentaciones.
- Historial y restauración de versiones.
- QR institucionales.
- Auditoría y copias cifradas.
- Rate limiting persistente para accesos institucionales.

## Requisitos

- Node.js 22.
- Una cuenta de Supabase.
- Un servicio web de Render.

## Preparar Supabase

1. Crea un proyecto nuevo en Supabase.
2. Abre **SQL Editor**.
3. Copia y ejecuta todo el contenido de `supabase/schema.sql`.
4. En **Project Settings → API**, copia la URL del proyecto y la clave `service_role`.
5. No hagas público el bucket `hub-documents`.

## Variables de entorno

Copia `.env.example` como `.env.local` para desarrollo. En Render crea las mismas variables desde **Environment**.

- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: clave privada `service_role`.
- `SUPABASE_STORAGE_BUCKET`: `hub-documents`.
- `ADMIN_EMAIL` y `ADMIN_EMAILS`: correo autorizado para `/admin`.
- `ADMIN_PASSWORD`: contraseña administrativa de mínimo 12 caracteres.
- `ADMIN_SESSION_SECRET`: secreto aleatorio para la sesión administrativa.
- `INSTITUTION_SESSION_SECRET`: secreto aleatorio distinto para portales.
- `BACKUP_ENCRYPTION_SECRET`: secreto aleatorio distinto para cifrar copias.

Genera cada secreto con:

```bash
openssl rand -hex 32
```

No subas `.env.local` ni claves a GitHub.

## Ejecutar localmente

```bash
npm ci
npm run dev
```

Abre `http://localhost:3000`.

## Publicar en Render

La raíz incluye `render.yaml`. Conecta un repositorio limpio a Render y elige **New → Blueprint**. Render detectará:

- Build: `npm ci && npm run build`
- Start: `npm start`
- Health check: `/`

Completa las variables privadas y despliega. El panel quedará disponible en `/admin`.

## Seguridad

- El navegador nunca recibe la `service_role` key.
- Supabase tiene RLS activo y el bucket es privado.
- Los documentos se entregan por una ruta del servidor que valida permisos.
- Las contraseñas institucionales se almacenan con PBKDF2 y sal aleatoria.
- Las cookies de sesión son `httpOnly`, `sameSite=strict` y `secure` en producción.
- Los PDF se validan y se rechazan funciones activas o archivos incrustados.

Antes de cargar documentos clínicos reales, cambia todos los secretos provisionales y prueba el acceso desde una ventana privada.

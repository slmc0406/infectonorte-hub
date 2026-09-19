# Guía de despliegue — Infectonorte HUB

## 1. Crear un repositorio limpio

1. En GitHub crea un repositorio nuevo, por ejemplo `infectonorte-hub-produccion`.
2. Descomprime este ZIP.
3. Sube **el contenido de la carpeta**, no el ZIP y no una carpeta dentro de otra.
4. Confirma que `package.json`, `render.yaml`, `app/`, `public/` y `supabase/` estén directamente en la raíz.
5. No copies archivos del repositorio anterior.

## 2. Preparar Supabase

1. Crea un proyecto nuevo en Supabase.
2. Ve a **SQL Editor → New query**.
3. Copia todo `supabase/schema.sql`, pulsa **Run** y confirma que no aparezcan errores.
4. Ve a **Storage** y confirma que exista `hub-documents` como bucket privado.
5. Ve a **Project Settings → API** y guarda temporalmente:
   - Project URL.
   - `service_role` key.

La clave `service_role` nunca debe publicarse en GitHub ni enviarse por mensajes.

## 3. Crear el servicio en Render

1. En Render elige **New → Blueprint**.
2. Conecta el repositorio nuevo.
3. Render leerá `render.yaml`.
4. Completa las variables privadas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAIL`
   - `ADMIN_EMAILS`
   - `ADMIN_PASSWORD`
5. Mantén `SUPABASE_STORAGE_BUCKET=hub-documents`.
6. Render generará automáticamente los tres secretos de sesión y respaldo.
7. Pulsa **Deploy Blueprint**.

Para uso clínico nacional se recomienda un plan de Render que no suspenda el servicio por inactividad. El plan gratuito sirve para montaje y pruebas, pero puede tardar en responder después de periodos sin uso.

## 4. Primera verificación

1. Abre la URL de Render en una ventana privada.
2. Confirma que aparezcan los logos de Infectonorte, Infectoped y Familias con Vacunas.
3. Abre `/admin` e ingresa con `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
4. Crea una institución de prueba.
5. Descarga su QR y ábrelo desde un teléfono sin sesión administrativa.
6. Comprueba una contraseña incorrecta y luego la correcta.
7. Sube un PDF de prueba como borrador.
8. Publícalo como recurso general y confirma que aparezca en Biblioteca.
9. Cámbialo a exclusivo de la institución y confirma que solo aparezca dentro de su portal.
10. Reemplaza el archivo y revisa que el historial muestre una nueva versión.
11. Crea una copia desde **Administración → Copias de seguridad**.

## 5. Dominio nacional

1. En Render abre **Settings → Custom Domains**.
2. Añade `hub.infectonorte.com`.
3. En el proveedor DNS de `infectonorte.com`, crea el registro CNAME que Render indique.
4. Espera a que Render muestre certificado SSL activo.
5. Cambia los QR definitivos únicamente después de confirmar el dominio.

## 6. Lista de seguridad antes de cargar información real

- El repositorio no contiene `.env.local`.
- La clave `service_role` existe únicamente en Render.
- El bucket `hub-documents` continúa privado.
- La contraseña administrativa tiene mínimo 16 caracteres y no se reutiliza.
- Los portales institucionales usan contraseñas diferentes.
- Se creó y verificó una copia cifrada.
- El acceso administrativo se probó desde una ventana privada.
- Los documentos cargados no contienen datos personales de pacientes.

## 7. Actualizaciones posteriores

Realiza cada cambio en una rama o copia local, ejecuta:

```bash
npm ci
npm test
npm run lint
```

Después sube el cambio a GitHub. Render desplegará automáticamente la nueva versión. Si el despliegue falla, la versión anterior continuará disponible y el registro de Render mostrará el error.

import { cookies } from 'next/headers';
import { verifySessionToken, cookieNames, InstitutionSessionPayload, AdminSessionPayload } from './auth';

// Helpers de sesión para Server Components / Route Handlers. El middleware ya
// protege las rutas (ver middleware.ts), pero cada página/handler vuelve a
// verificar del lado servidor antes de leer datos — nunca confiar solo en
// haber pasado el middleware para decisiones de autorización sensibles.
export async function getInstitutionSession(): Promise<InstitutionSessionPayload | null> {
  const token = cookies().get(cookieNames.institution)?.value;
  if (!token) return null;
  const payload = await verifySessionToken<InstitutionSessionPayload>(token);
  return payload && payload.kind === 'institution' ? payload : null;
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const token = cookies().get(cookieNames.admin)?.value;
  if (!token) return null;
  const payload = await verifySessionToken<AdminSessionPayload>(token);
  return payload && payload.kind === 'admin' ? payload : null;
}

// Para usar en Route Handlers de /api/admin/**: el middleware ya protege
// /admin/** en la navegación, pero cada handler de API vuelve a verificar la
// sesión — autorización del lado servidor, nunca solo del lado del cliente.
export async function requireAdmin(): Promise<AdminSessionPayload | null> {
  return getAdminSession();
}

import { SignJWT, jwtVerify } from 'jose';

// Sesión propia firmada con JWT (httpOnly cookie), no Supabase Auth todavía:
// hoy no hay cuentas individuales por institución, así que un JWT simple con
// institution_id + expiración es suficiente y migra sin fricción a Supabase
// Auth cuando existan cuentas individuales (ver docs/00-estrategia-arquitectura.md, sección 6).

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me-in-production'
);

const INSTITUTION_SESSION_COOKIE = 'ih_inst_session';
const ADMIN_SESSION_COOKIE = 'ih_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 10; // 10 horas

export interface InstitutionSessionPayload {
  kind: 'institution';
  institutionId: string;
  slug: string;
}

export interface AdminSessionPayload {
  kind: 'admin';
  adminId: string;
  role: 'superadmin' | 'editor';
}

async function signSession(payload: InstitutionSessionPayload | AdminSessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(SESSION_SECRET);
}

export async function createInstitutionSessionToken(institutionId: string, slug: string) {
  return signSession({ kind: 'institution', institutionId, slug });
}

export async function createAdminSessionToken(adminId: string, role: 'superadmin' | 'editor') {
  return signSession({ kind: 'admin', adminId, role });
}

export async function verifySessionToken<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    return payload as unknown as T;
  } catch {
    return null;
  }
}

export const cookieNames = {
  institution: INSTITUTION_SESSION_COOKIE,
  admin: ADMIN_SESSION_COOKIE,
};

export const sessionMaxAge = SESSION_TTL_SECONDS;

// ── Rate limiting de intentos de login ──────────────────────────────────
// Implementación en memoria para el MVP demo (se reinicia si el servidor se
// reinicia). En producción reemplazar por Upstash Redis o una tabla
// `login_attempts` en Postgres — la interfaz (checkRateLimit/registerAttempt)
// no cambia al migrar.
const attempts = new Map<string, { count: number; firstAttemptAt: number }>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 5;

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const record = attempts.get(key);
  if (!record) return { allowed: true };
  const elapsed = Date.now() - record.firstAttemptAt;
  if (elapsed > WINDOW_MS) {
    attempts.delete(key);
    return { allowed: true };
  }
  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSeconds: Math.ceil((WINDOW_MS - elapsed) / 1000) };
  }
  return { allowed: true };
}

export function registerFailedAttempt(key: string) {
  const record = attempts.get(key);
  if (!record) {
    attempts.set(key, { count: 1, firstAttemptAt: Date.now() });
    return;
  }
  record.count += 1;
}

export function clearAttempts(key: string) {
  attempts.delete(key);
}

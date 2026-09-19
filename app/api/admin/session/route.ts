import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdministratorByEmail } from '@/data/administrators';
import {
  createAdminSessionToken,
  cookieNames,
  sessionMaxAge,
  checkRateLimit,
  registerFailedAttempt,
  clearAttempts,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const body = await req.json().catch(() => null);
  const email = body?.email;
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json({ error: 'Correo y contraseña requeridos.' }, { status: 400 });
  }

  const rateLimitKey = `${ip}:${String(email).toLowerCase()}`;
  const rate = checkRateLimit(rateLimitKey);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Demasiados intentos. Intenta de nuevo en unos minutos.' }, { status: 429 });
  }

  const admin = getAdministratorByEmail(String(email));
  const generic = () => {
    registerFailedAttempt(rateLimitKey);
    return NextResponse.json({ error: 'Credenciales incorrectas.' }, { status: 401 });
  };

  if (!admin) return generic();
  const valid = await bcrypt.compare(String(password), admin.passwordHash);
  if (!valid) return generic();

  clearAttempts(rateLimitKey);
  const token = await createAdminSessionToken(admin.id, admin.role);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieNames.admin, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: sessionMaxAge,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieNames.admin, '', { path: '/', maxAge: 0 });
  return res;
}

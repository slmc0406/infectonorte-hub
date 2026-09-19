import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getInstitutionBySlug } from '@/data/institutions';
import { getAccessByInstitutionId } from '@/data/institution-access';
import {
  createInstitutionSessionToken,
  cookieNames,
  sessionMaxAge,
  checkRateLimit,
  registerFailedAttempt,
  clearAttempts,
} from '@/lib/auth';

// POST /api/institutions/[slug]/session — login institucional.
// Nunca se confirma si la institución existe: una contraseña incorrecta y un
// slug inexistente devuelven el mismo mensaje genérico, para no filtrar
// información por enumeración de instituciones.
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const rateLimitKey = `${ip}:${params.slug}`;

  const rate = checkRateLimit(rateLimitKey);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const password = body?.password;
  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Contraseña requerida.' }, { status: 400 });
  }

  const institution = getInstitutionBySlug(params.slug);
  const generic = () => {
    registerFailedAttempt(rateLimitKey);
    return NextResponse.json({ error: 'Contraseña institucional incorrecta.' }, { status: 401 });
  };

  if (!institution || institution.status !== 'activa') return generic();

  const access = getAccessByInstitutionId(institution.id);
  if (!access) return generic();

  const valid = await bcrypt.compare(password, access.passwordHash);
  if (!valid) return generic();

  clearAttempts(rateLimitKey);
  const token = await createInstitutionSessionToken(institution.id, institution.slug);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieNames.institution, token, {
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
  res.cookies.set(cookieNames.institution, '', { path: '/', maxAge: 0 });
  return res;
}

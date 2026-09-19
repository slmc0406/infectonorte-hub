import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/lib/session';
import { getInstitutionById } from '@/data/institutions';
import { setPasswordHash } from '@/data/institution-access';

// Cambiar la contraseña institucional NUNCA regenera ni invalida el QR — el
// QR sigue apuntando a la misma URL estable (/i/[slug]).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const institution = getInstitutionById(params.id);
  if (!institution) return NextResponse.json({ error: 'Institución no encontrada.' }, { status: 404 });

  const body = await req.json().catch(() => null);
  const password = body?.password;
  if (!password || String(password).length < 6) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
  }

  const hash = await bcrypt.hash(String(password), 10);
  setPasswordHash(institution.id, hash);

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/lib/session';
import { createInstitution, getInstitutionBySlug } from '@/data/institutions';
import { setPasswordHash } from '@/data/institution-access';
import { slugify } from '@/lib/slug';

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  const city = body?.city?.trim();
  const department = body?.department?.trim();
  const password = body?.password;

  if (!name || !city || !department || !password) {
    return NextResponse.json({ error: 'Nombre, ciudad, departamento y contraseña son obligatorios.' }, { status: 400 });
  }

  let slug = body?.slug?.trim() ? slugify(body.slug) : slugify(name);
  if (getInstitutionBySlug(slug)) slug = `${slug}-${Math.floor(Math.random() * 1000)}`;

  const institution = createInstitution({
    name,
    slug,
    city,
    department,
    contactEmail: body?.contactEmail?.trim() || undefined,
    contactPhone: body?.contactPhone?.trim() || undefined,
    services: Array.isArray(body?.services) ? body.services : [],
  });

  const hash = await bcrypt.hash(String(password), 10);
  setPasswordHash(institution.id, hash);

  // Al guardar: portal, URL y acceso quedan configurados de inmediato — el QR
  // se genera bajo demanda en /api/admin/institutions/[id]/qr (misma URL estable).
  return NextResponse.json({ institution });
}

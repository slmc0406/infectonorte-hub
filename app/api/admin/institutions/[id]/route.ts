import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { getInstitutionById, updateInstitution } from '@/data/institutions';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const institution = getInstitutionById(params.id);
  if (!institution) return NextResponse.json({ error: 'Institución no encontrada.' }, { status: 404 });

  const body = await req.json().catch(() => null);
  const patch: Record<string, unknown> = {};
  for (const key of ['name', 'city', 'department', 'contactEmail', 'contactPhone', 'status', 'services'] as const) {
    if (body?.[key] !== undefined) patch[key] = body[key];
  }

  const updated = updateInstitution(params.id, patch);
  return NextResponse.json({ institution: updated });
}

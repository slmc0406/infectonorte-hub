import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { getResourceById, updateResource } from '@/data/resources';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const resource = getResourceById(params.id);
  if (!resource) return NextResponse.json({ error: 'Recurso no encontrado.' }, { status: 404 });

  const body = await req.json().catch(() => null);
  const patch: Record<string, unknown> = {};
  for (const key of ['title', 'summary', 'description', 'status', 'visibility', 'version', 'nextReviewAt'] as const) {
    if (body?.[key] !== undefined) patch[key] = body[key];
  }
  if (body?.publish === true) {
    patch.status = 'vigente';
    patch.publishedAt = new Date().toISOString();
  }

  const updated = updateResource(params.id, patch);
  return NextResponse.json({ resource: updated });
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { createResource, getResourceBySlug } from '@/data/resources';
import { authors } from '@/data/authors';
import { slugify } from '@/lib/slug';
import { typePath as resolveTypePath } from '@/data/taxonomy';
import { ResourceType } from '@/lib/types';

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const title = body?.title?.trim();
  const type = body?.type as ResourceType;
  const publish = body?.publish === true;

  if (!title || !type) {
    return NextResponse.json({ error: 'Título y tipo son obligatorios.' }, { status: 400 });
  }

  let slug = body?.slug?.trim() ? slugify(body.slug) : slugify(title);
  if (getResourceBySlug(slug)) slug = `${slug}-${Math.floor(Math.random() * 1000)}`;

  const authorRefs = (body?.authorIds as string[] | undefined)?.map((id: string) => {
    const author = authors.find((a) => a.id === id);
    return author ? { author, role: 'autor' as const } : null;
  }).filter(Boolean) as { author: (typeof authors)[number]; role: 'autor' }[] | undefined;

  const resource = createResource({
    title,
    slug,
    summary: body?.summary?.trim() ?? '',
    description: body?.description?.trim() ?? '',
    type,
    typePath: resolveTypePath(type),
    status: publish ? 'vigente' : 'borrador',
    visibility: body?.visibility ?? 'general_infectonorte',
    ownerInstitutionId: body?.ownerInstitutionId || undefined,
    areas: Array.isArray(body?.areas) ? body.areas : [],
    populations: Array.isArray(body?.populations) ? body.populations : [],
    syndromes: Array.isArray(body?.syndromes) ? body.syndromes : [],
    tags: Array.isArray(body?.tags) ? body.tags : [],
    authors: authorRefs ?? [],
    version: body?.version?.trim() || '1.0',
    nextReviewAt: body?.nextReviewAt || undefined,
  });

  return NextResponse.json({ resource });
}

import { NextRequest, NextResponse } from 'next/server';
import { getAllPublicResources } from '@/data/resources';
import { searchResources } from '@/lib/search';
import { typeLabels } from '@/lib/utils';

// Sugerencias de búsqueda instantánea sobre la Biblioteca General (contenido
// público / general Infectonorte). El buscador dentro de un portal institucional
// usa su propio endpoint autenticado para incluir contenido exclusivo.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ results: [] });

  // Registro anónimo de búsquedas sin resultado — ver analytics_events en el
  // modelo de datos. Aquí solo se calcula; el registro real ocurre en /buscar.
  const results = searchResources(getAllPublicResources(), q).slice(0, 6).map((r) => ({
    slug: r.slug,
    typePath: r.typePath,
    title: r.title,
    type: typeLabels[r.type],
  }));

  return NextResponse.json({ results });
}

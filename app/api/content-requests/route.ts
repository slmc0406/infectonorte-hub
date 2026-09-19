import { NextRequest, NextResponse } from 'next/server';
import { contentRequests } from '@/data/content-requests';

// Demo: agrega en memoria (se pierde al reiniciar el servidor). En producción,
// INSERT a la tabla `content_requests`; el panel admin las agrupa por tema similar.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const topic = body?.topic?.trim();
  const description = body?.description?.trim();

  if (!topic || !description) {
    return NextResponse.json({ error: 'Cuéntanos el tema y una breve descripción.' }, { status: 400 });
  }

  contentRequests.unshift({
    id: `req-${Date.now()}`,
    topic,
    description,
    requesterContact: body?.contact?.trim() || undefined,
    status: 'nueva',
    count: 1,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

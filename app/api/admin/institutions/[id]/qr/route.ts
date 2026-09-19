import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { requireAdmin } from '@/lib/session';
import { getInstitutionById } from '@/data/institutions';

// El QR apunta siempre a /i/[slug] — nunca incluye contraseña ni token.
// Formatos soportados para descarga desde el panel admin: png (por defecto) y svg.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const institution = getInstitutionById(params.id);
  if (!institution) return NextResponse.json({ error: 'Institución no encontrada.' }, { status: 404 });

  const format = req.nextUrl.searchParams.get('format') === 'svg' ? 'svg' : 'png';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  const targetUrl = `${siteUrl}/i/${institution.slug}`;

  if (format === 'svg') {
    const svg = await QRCode.toString(targetUrl, { type: 'svg', margin: 1, color: { dark: '#0B1220', light: '#FFFFFF' } });
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="qr-${institution.slug}.svg"`,
      },
    });
  }

  const buffer = await QRCode.toBuffer(targetUrl, { type: 'png', margin: 1, width: 512, color: { dark: '#0B1220', light: '#FFFFFF' } });
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="qr-${institution.slug}.png"`,
    },
  });
}

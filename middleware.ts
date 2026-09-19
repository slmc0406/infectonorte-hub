import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, cookieNames, InstitutionSessionPayload, AdminSessionPayload } from '@/lib/auth';

// Autorización del lado servidor — nunca confiar en el frontend.
// Protege /i/[slug]/portal/** verificando que el JWT de sesión corresponde
// exactamente a ese slug (aislamiento entre instituciones), y protege /admin/**
// (excepto la página de login /admin) verificando la sesión de administrador.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const institutionPortalMatch = pathname.match(/^\/i\/([^/]+)\/portal(\/.*)?$/);
  if (institutionPortalMatch) {
    const slug = institutionPortalMatch[1];
    const token = req.cookies.get(cookieNames.institution)?.value;
    const payload = token ? await verifySessionToken<InstitutionSessionPayload>(token) : null;
    if (!payload || payload.kind !== 'institution' || payload.slug !== slug) {
      const loginUrl = new URL(`/i/${slug}`, req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const token = req.cookies.get(cookieNames.admin)?.value;
    const payload = token ? await verifySessionToken<AdminSessionPayload>(token) : null;
    if (!payload || payload.kind !== 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/i/:slug*/portal/:path*', '/admin/:path*'],
};

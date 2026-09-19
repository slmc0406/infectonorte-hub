import { Metadata } from 'next';
import Link from 'next/link';
import { Building2, QrCode } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card } from '@/components/ui/card';
import { DemoBadge } from '@/components/ui/badge';
import { institutions } from '@/data/institutions';

export const metadata: Metadata = { title: 'Instituciones' };

export default function InstitucionesPage() {
  const activas = institutions.filter((i) => i.status === 'activa');

  return (
    <>
      <SiteHeader />
      <main className="container-hub max-w-2xl py-10">
        <h1 className="text-2xl font-semibold text-ink">¿Perteneces a una institución?</h1>
        <p className="mt-2 text-ink-soft">
          Cada institución aliada tiene un portal privado propio, con contenido exclusivo y adaptaciones
          institucionales. Se accede escaneando el código QR entregado por Infectonorte a tu institución,
          o desde el enlace directo abajo.
        </p>

        <div className="mt-8 flex items-start gap-3 rounded-lg border border-border bg-surface-sunken p-4 text-sm text-ink-soft">
          <QrCode size={18} className="mt-0.5 shrink-0 text-primary-600" />
          <p>
            El QR de tu institución apunta siempre a la misma dirección — nunca contiene la contraseña. Si tu
            institución cambia la contraseña, el mismo QR sigue funcionando.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {activas.map((inst) => (
            <Link key={inst.id} href={`/i/${inst.slug}`}>
              <Card className="flex items-center gap-4 p-4 hover:shadow-float transition-shadow">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-50 text-primary-600">
                  <Building2 size={20} strokeWidth={1.75} />
                </span>
                <div className="flex-1">
                  <p className="font-medium text-ink">{inst.name}</p>
                  <p className="text-sm text-ink-faint">{inst.city}, {inst.department}</p>
                </div>
                {inst.isDemo && <DemoBadge />}
              </Card>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-sm text-ink-faint">
          En este MVP solo existe una institución piloto (demo). El resto de las ~19 instituciones se crean desde
          el panel administrativo sin necesidad de programar.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

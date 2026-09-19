import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Building2 } from 'lucide-react';
import { getInstitutionBySlug } from '@/data/institutions';
import { InstitutionLoginForm } from '@/components/institution-login-form';
import { DemoBadge } from '@/components/ui/badge';

// noindex: el acceso institucional nunca debe ser indexable ni descubrirse
// por buscadores externos.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function InstitutionLoginPage({ params }: { params: { slug: string } }) {
  const institution = getInstitutionBySlug(params.slug);
  if (!institution || institution.status !== 'activa') notFound();

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-500 text-white">
            <Building2 size={22} strokeWidth={1.75} />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-ink">
            Infectonorte HUB <span className="text-ink-faint">×</span> {institution.name}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">Portal clínico institucional</p>
          {institution.isDemo && <DemoBadge />}
        </div>

        <div className="mt-8 rounded-xl border border-border bg-white p-6 shadow-subtle">
          <InstitutionLoginForm slug={institution.slug} />
        </div>

        <p className="mt-6 text-center text-xs text-ink-faint">
          ¿Problemas para ingresar? Contacta al equipo de Infectonorte de tu institución.
        </p>
      </div>
    </main>
  );
}

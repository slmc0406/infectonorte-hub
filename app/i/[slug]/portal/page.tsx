import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getInstitutionSession } from '@/lib/session';
import { getInstitutionBySlug } from '@/data/institutions';
import { getResourcesForInstitution } from '@/data/resources';
import { getUpdatesForInstitution } from '@/data/institution-updates';
import { PortalHeader } from '@/components/portal-header';
import { SearchBar } from '@/components/search-bar';
import { CommandCenter } from '@/components/command-center';
import { getAreaIcon } from '@/lib/icons';

export const metadata: Metadata = { robots: { index: false, follow: false } };

const quickAccess = [
  { label: 'Algoritmos', tipo: 'algoritmo', icon: 'infectologia' },
  { label: 'PROA', area: 'proa', icon: 'proa' },
  { label: 'PCI', area: 'pci', icon: 'pci' },
  { label: 'Epidemiología', area: 'epidemiologia', icon: 'epidemiologia' },
  { label: 'Presentaciones', tipo: 'presentacion', icon: 'infectologia' },
  { label: 'Infografías', tipo: 'infografia', icon: 'infectologia' },
];

export default async function InstitutionPortalPage({ params }: { params: { slug: string } }) {
  const institution = getInstitutionBySlug(params.slug);
  if (!institution) notFound();

  // El middleware ya protege esta ruta; se verifica de nuevo aquí porque nunca
  // se debe confiar solo en el middleware para decisiones de autorización.
  const session = await getInstitutionSession();
  if (!session || session.slug !== institution.slug) notFound();

  const resources = getResourcesForInstitution(institution.id);
  const updates = getUpdatesForInstitution(institution.id);

  return (
    <>
      <PortalHeader slug={institution.slug} institutionName={institution.name} />
      <main className="container-hub py-10">
        <h1 className="text-2xl font-semibold text-ink">¿Qué necesitas hoy?</h1>
        <div className="mt-4 max-w-xl">
          <SearchBar action={`/i/${institution.slug}/portal/biblioteca`} size="md" />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {quickAccess.map((item) => {
            const Icon = getAreaIcon(item.icon);
            const params = new URLSearchParams();
            if (item.tipo) params.set('tipo', item.tipo);
            if (item.area) params.set('area', item.area);
            return (
              <Link
                key={item.label}
                href={`/i/${institution.slug}/portal/biblioteca?${params.toString()}`}
                className="group flex flex-col items-center gap-2 rounded-lg border border-transparent p-3 text-center hover:border-border hover:bg-white hover:shadow-subtle transition-all"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-600 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <span className="text-xs font-medium text-ink-soft">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-ink">Estado de tu conocimiento clínico</h2>
          <CommandCenter resources={resources} />
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-ink">Actualizaciones</h2>
          <div className="divide-y divide-border rounded-lg border border-border bg-white">
            {updates.map((u) => {
              const resource = resources.find((r) => r.id === u.resourceId);
              return (
                <Link
                  key={u.id}
                  href={resource ? `/i/${institution.slug}/portal/${resource.typePath}/${resource.slug}` : '#'}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-sunken"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        u.label === 'NUEVO' ? 'bg-primary-500 text-white' : 'bg-accent-500 text-white'
                      }`}
                    >
                      {u.label}
                    </span>
                    <p className="font-medium text-ink">{u.title}</p>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-ink-faint" />
                </Link>
              );
            })}
            {updates.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-ink-faint">Aún no hay actualizaciones para tu institución.</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SearchBar } from '@/components/search-bar';
import { ResourceCard } from '@/components/resource-card';
import { Button } from '@/components/ui/button';
import { getAllPublicResources } from '@/data/resources';
import { getAreaIcon } from '@/lib/icons';
import { ArrowRight } from 'lucide-react';

const quickAccess = [
  { label: 'Algoritmos', href: '/biblioteca?tipo=algoritmo', icon: 'infectologia' },
  { label: 'PROA', href: '/biblioteca?area=proa', icon: 'proa' },
  { label: 'PCI', href: '/biblioteca?area=pci', icon: 'pci' },
  { label: 'Vacunación', href: '/biblioteca?area=vacunacion', icon: 'vacunacion' },
  { label: 'Pediatría', href: '/biblioteca?area=pediatria', icon: 'pediatria' },
  { label: 'Microbiología', href: '/biblioteca?area=microbiologia', icon: 'microbiologia' },
  { label: 'Epidemiología', href: '/biblioteca?area=epidemiologia', icon: 'epidemiologia' },
  { label: 'Presentaciones', href: '/academia', icon: 'infectologia' },
  { label: 'Infografías', href: '/biblioteca?tipo=infografia', icon: 'infectologia' },
];

export default function HomePage() {
  const resources = getAllPublicResources();
  const featured = resources.slice(0, 4);
  const recent = [...resources].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)).slice(0, 5);

  return (
    <>
      <div className="demo-banner">Entorno de demostración — MVP con datos simulados</div>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="container-hub pt-16 pb-10 text-center sm:pt-24 sm:pb-16">
          <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Infectonorte HUB
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-ink-soft">
            Conocimiento clínico. Disponible cuando lo necesitas.
          </p>
          <div className="mx-auto mt-8 max-w-2xl">
            <SearchBar />
          </div>
        </section>

        {/* Quick access */}
        <section className="container-hub pb-16">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
            {quickAccess.map((item) => {
              const Icon = getAreaIcon(item.icon);
              return (
                <Link
                  key={item.label}
                  href={item.href}
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
        </section>

        {/* Destacados */}
        <section className="container-hub pb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-ink">Destacados</h2>
            <Link href="/biblioteca" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
              Ver biblioteca completa <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </section>

        {/* Actualizaciones recientes */}
        <section className="container-hub pb-16">
          <h2 className="mb-6 text-xl font-semibold text-ink">Actualizaciones recientes</h2>
          <div className="divide-y divide-border rounded-lg border border-border bg-white">
            {recent.map((r) => (
              <Link
                key={r.id}
                href={`/${r.typePath}/${r.slug}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-sunken"
              >
                <div>
                  <p className="font-medium text-ink">{r.title}</p>
                  <p className="text-sm text-ink-faint">Publicado el {new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(new Date(r.publishedAt))}</p>
                </div>
                <ArrowRight size={16} className="shrink-0 text-ink-faint" />
              </Link>
            ))}
          </div>
        </section>

        {/* CTA institucional */}
        <section className="container-hub pb-24">
          <div className="rounded-xl bg-primary-500 px-8 py-12 text-center text-white sm:px-16">
            <h2 className="text-2xl font-semibold">¿Perteneces a una institución?</h2>
            <p className="mx-auto mt-2 max-w-md text-primary-100">
              Ingresa a tu portal institucional para ver contenido exclusivo, adaptaciones locales y
              actualizaciones de tu institución.
            </p>
            <Button href="/instituciones" variant="secondary" size="lg" className="mt-6">
              Acceder a mi institución
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

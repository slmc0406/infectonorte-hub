import { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ResourceCard } from '@/components/resource-card';
import { getAllPublicResources } from '@/data/resources';

export const metadata: Metadata = { title: 'Academia' };

export default function AcademiaPage() {
  const presentations = getAllPublicResources()
    .filter((r) => r.type === 'presentacion')
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

  return (
    <>
      <SiteHeader />
      <main className="container-hub py-10">
        <h1 className="text-2xl font-semibold text-ink">Academia Infectonorte</h1>
        <p className="mt-1 max-w-xl text-ink-soft">
          Biblioteca de presentaciones académicas: ponente, evento y material relacionado de cada sesión.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {presentations.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

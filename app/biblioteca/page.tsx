import { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SearchBar } from '@/components/search-bar';
import { FilterPanel } from '@/components/filter-panel';
import { ResourceCard } from '@/components/resource-card';
import { EmptyState } from '@/components/empty-state';
import { getAllPublicResources } from '@/data/resources';
import { searchResources } from '@/lib/search';
import { parseSearchFilters, parseQuery } from '@/lib/query';

export const metadata: Metadata = { title: 'Biblioteca general' };

export default function BibliotecaPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const filters = parseSearchFilters(searchParams);
  const q = parseQuery(searchParams);
  const results = searchResources(getAllPublicResources(), q, filters);

  return (
    <>
      <SiteHeader />
      <main className="container-hub py-10">
        <h1 className="text-2xl font-semibold text-ink">Biblioteca general</h1>
        <p className="mt-1 text-ink-soft">Conocimiento clínico disponible para todas las instituciones.</p>

        <div className="mt-6 max-w-xl">
          <SearchBar size="md" action="/biblioteca" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <FilterPanel />
          </aside>
          <div>
            <p className="mb-4 text-sm text-ink-faint">{results.length} recursos encontrados</p>
            {results.length === 0 ? (
              <EmptyState
                title="No encontramos contenido con esos filtros"
                description="Prueba quitando algún filtro, o cuéntanos qué necesitas."
                actionLabel="Solicitar contenido"
                actionHref="/solicitar-contenido"
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((r) => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

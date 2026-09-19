import { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SearchBar } from '@/components/search-bar';
import { ResourceCard } from '@/components/resource-card';
import { EmptyState } from '@/components/empty-state';
import { getAllPublicResources } from '@/data/resources';
import { searchResources } from '@/lib/search';
import { parseQuery, parseSearchFilters } from '@/lib/query';
import { logEvent } from '@/lib/analytics';

export const metadata: Metadata = { title: 'Resultados de búsqueda' };

export default function BuscarPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const q = parseQuery(searchParams);
  const filters = parseSearchFilters(searchParams);
  const results = searchResources(getAllPublicResources(), q, filters);

  if (q) logEvent({ type: results.length > 0 ? 'search' : 'search_no_results', query: q });

  return (
    <>
      <SiteHeader />
      <main className="container-hub py-10">
        <div className="mx-auto max-w-2xl">
          <SearchBar action="/buscar" size="md" />
        </div>

        <div className="mt-8">
          <p className="text-sm text-ink-faint">
            {results.length} resultados para <span className="font-medium text-ink">&ldquo;{q}&rdquo;</span>
          </p>

          {results.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="No encontramos resultados"
                description="Revisa la ortografía o prueba con un término más general. También puedes solicitar este contenido al equipo de Infectonorte."
                actionLabel="Solicitar contenido"
                actionHref="/solicitar-contenido"
              />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

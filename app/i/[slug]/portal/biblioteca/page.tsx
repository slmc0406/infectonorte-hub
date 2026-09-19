import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getInstitutionSession } from '@/lib/session';
import { getInstitutionBySlug } from '@/data/institutions';
import { getResourcesForInstitution } from '@/data/resources';
import { searchResources } from '@/lib/search';
import { parseQuery, parseSearchFilters } from '@/lib/query';
import { PortalHeader } from '@/components/portal-header';
import { SearchBar } from '@/components/search-bar';
import { FilterPanel } from '@/components/filter-panel';
import { ResourceCard } from '@/components/resource-card';
import { EmptyState } from '@/components/empty-state';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function InstitutionLibraryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const institution = getInstitutionBySlug(params.slug);
  if (!institution) notFound();

  const session = await getInstitutionSession();
  if (!session || session.slug !== institution.slug) notFound();

  const q = parseQuery(searchParams);
  const filters = parseSearchFilters(searchParams);
  const results = searchResources(getResourcesForInstitution(institution.id), q, filters);
  const basePath = `/i/${institution.slug}/portal`;

  return (
    <>
      <PortalHeader slug={institution.slug} institutionName={institution.name} />
      <main className="container-hub py-10">
        <h1 className="text-2xl font-semibold text-ink">Biblioteca institucional</h1>
        <p className="mt-1 text-ink-soft">Incluye contenido general de Infectonorte y contenido exclusivo de {institution.name}.</p>

        <div className="mt-6 max-w-xl">
          <SearchBar size="md" action={`${basePath}/biblioteca`} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <FilterPanel />
          </aside>
          <div>
            <p className="mb-4 text-sm text-ink-faint">{results.length} recursos disponibles</p>
            {results.length === 0 ? (
              <EmptyState title="No encontramos contenido con esos filtros" description="Prueba quitando algún filtro." />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((r) => (
                  <ResourceCard key={r.id} resource={r} basePath={basePath} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

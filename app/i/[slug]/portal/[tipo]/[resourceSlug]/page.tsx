import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getInstitutionSession } from '@/lib/session';
import { getInstitutionBySlug } from '@/data/institutions';
import { getResourceBySlug, getResourcesForInstitution } from '@/data/resources';
import { PortalHeader } from '@/components/portal-header';
import { ResourceDetail } from '@/components/resource-detail';
import { logEvent } from '@/lib/analytics';

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Ficha de recurso dentro del portal institucional. La autorización no se basa
// en la URL: se recalcula del lado servidor el conjunto de recursos visibles
// para esta institución (getResourcesForInstitution) y se exige que el recurso
// pedido esté en ese conjunto — así una institución nunca puede ver contenido
// exclusivo de otra cambiando el slug en la URL.
export default async function InstitutionResourcePage({
  params,
}: {
  params: { slug: string; tipo: string; resourceSlug: string };
}) {
  const institution = getInstitutionBySlug(params.slug);
  if (!institution) notFound();

  const session = await getInstitutionSession();
  if (!session || session.slug !== institution.slug) notFound();

  const allowedResources = getResourcesForInstitution(institution.id);
  const resource = getResourceBySlug(params.resourceSlug);

  if (!resource || resource.typePath !== params.tipo) notFound();
  if (!allowedResources.some((r) => r.id === resource.id)) notFound();

  logEvent({ type: 'view', resourceId: resource.id, institutionId: institution.id });

  return (
    <>
      <PortalHeader slug={institution.slug} institutionName={institution.name} />
      <ResourceDetail resource={resource} basePath={`/i/${institution.slug}/portal`} />
    </>
  );
}

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ResourceDetail } from '@/components/resource-detail';
import { getResourceBySlug } from '@/data/resources';
import { logEvent } from '@/lib/analytics';

// Ficha de recurso unificada para toda la Biblioteca General.
// La URL amigable (/algoritmos/[slug], /infografias/[slug], /academia/[slug]...)
// se resuelve validando que el segmento `tipo` coincida con resource.typePath —
// así un recurso de un tipo nunca responde bajo la URL de otro tipo.
export function generateMetadata({ params }: { params: { tipo: string; slug: string } }): Metadata {
  const resource = getResourceBySlug(params.slug);
  if (!resource || resource.typePath !== params.tipo || resource.visibility === 'exclusivo') {
    return { title: 'No encontrado' };
  }
  return { title: resource.title, description: resource.summary };
}

export default function ResourcePage({ params }: { params: { tipo: string; slug: string } }) {
  const resource = getResourceBySlug(params.slug);

  if (!resource || resource.typePath !== params.tipo) notFound();
  // El contenido exclusivo/institucional nunca se sirve por la ruta pública,
  // incluso si alguien adivina el slug — aislamiento server-side.
  if (resource.visibility === 'exclusivo' || resource.visibility === 'instituciones_seleccionadas') notFound();

  logEvent({ type: 'view', resourceId: resource.id });

  return (
    <>
      <SiteHeader />
      <main>
        <ResourceDetail resource={resource} />
      </main>
      <SiteFooter />
    </>
  );
}

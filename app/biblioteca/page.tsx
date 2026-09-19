import { FileText } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SearchExperience } from "@/components/search-experience";
import { ResourceCard } from "@/components/resource-card";
import { formatCatalogDate, getPublicResources } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function BibliotecaPage({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  const resources = await getPublicResources();
  const { area } = await searchParams;
  return <main><SiteHeader /><section className="page-hero shell"><span className="section-kicker">Biblioteca clínica</span><h1>Conocimiento que encuentra su camino.</h1><p>Explora documentos generales publicados por Infectonorte con trazabilidad y control de versión.</p></section><section className="library-main library-full shell"><SearchExperience resources={resources} initialArea={area || "Todos"} /><div className="library-count"><strong>{resources.length} {resources.length === 1 ? "recurso publicado" : "recursos publicados"}</strong><span>{resources[0] ? `Actualizada ${formatCatalogDate(resources[0].updatedAt)}` : "Sin contenido publicado"}</span></div>{resources.length ? <div className="all-resources">{resources.map((resource) => <ResourceCard resource={resource} key={resource.id} />)}</div> : <div className="catalog-empty"><FileText /><h3>Aún no hay recursos generales publicados</h3><p>Cuando el administrador publique el primero, estará disponible inmediatamente en esta biblioteca.</p></div>}</section></main>;
}

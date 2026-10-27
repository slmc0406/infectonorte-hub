import { SiteHeader } from "@/components/site-header";
import { SearchExperience } from "@/components/search-experience";
import { getPublicResources } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function BibliotecaPage({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  const resources = await getPublicResources();
  const { area } = await searchParams;
  return <main><SiteHeader /><section className="page-hero shell"><span className="section-kicker">Biblioteca clínica</span><h1>Conocimiento que encuentra su camino.</h1><p>Explora documentos generales publicados por Infectonorte con trazabilidad y control de versión.</p></section><section className="library-main library-full shell"><SearchExperience resources={resources} initialArea={area || "Todos"} /></section></main>;
}

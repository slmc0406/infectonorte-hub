import Link from "next/link";
import { ArrowRight, Clock3, FileText, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SearchExperience } from "@/components/search-experience";
import { ResourceCard } from "@/components/resource-card";
import { formatCatalogDate, getPublicResources } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { EcosystemBrand } from "@/components/brand";

export const dynamic = "force-dynamic";

export default async function Home() {
  const resources = await getPublicResources();
  const categoryCounts = Array.from(resources.reduce((map, resource) => {
    map.set(resource.category, (map.get(resource.category) || 0) + 1);
    return map;
  }, new Map<string, number>())).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return <main>
    <SiteHeader />
    <section className="home-hero shell">
      <div className="eyebrow"><Sparkles size={14} /> Conocimiento clínico curado por Infectonorte e Infectoped</div>
      <h1>Encuentra lo que necesitas.<br /><span>Decide con confianza.</span></h1>
      <p>Algoritmos, protocolos y herramientas clínicas publicados y disponibles cuando importa.</p>
      <SearchExperience resources={resources} compact />
      <div className="quick-terms"><span>Explora:</span><Link href="/biblioteca">Biblioteca clínica</Link><Link href="/academia">Academia</Link><Link href="/acceso-institucional">Mi institución</Link></div>
    </section>
    <section className="shell category-section">
      <div className="section-heading"><div><span className="section-kicker">Explorar por área</span><h2>Todo el conocimiento, organizado.</h2></div><Button variant="ghost" asChild><Link href="/biblioteca">Ver biblioteca <ArrowRight /></Link></Button></div>
      {categoryCounts.length ? <div className="category-grid">{categoryCounts.map(([label, count]) => <Link href={`/biblioteca?area=${encodeURIComponent(label)}`} className="category-card" key={label}><span className="category-icon"><FileText size={22} /></span><div><strong>{label}</strong><span>{count} {count === 1 ? "recurso" : "recursos"}</span></div><ArrowRight size={17} /></Link>)}</div> : <div className="catalog-empty"><FileText /><h3>La biblioteca está lista para recibir contenido</h3><p>Los recursos generales que publiques desde administración aparecerán aquí automáticamente.</p></div>}
    </section>
    {resources.length > 0 && <section className="soft-section"><div className="shell"><div className="section-heading"><div><span className="section-kicker">Selección reciente</span><h2>Últimos recursos publicados</h2></div></div><div className="resource-grid">{resources.slice(0, 3).map((resource) => <ResourceCard resource={resource} key={resource.id} />)}</div></div></section>}
    {resources.length > 3 && <section className="shell update-section"><div className="section-heading"><div><span className="section-kicker">Al día</span><h2>Actualizaciones recientes</h2></div></div><div className="updates-list">{resources.slice(3, 8).map((item) => <Link href={`/recursos/${item.id}`} className="update-row" key={item.id}><Clock3 size={19} /><div><span>VERSIÓN {item.version}</span><strong>{item.title}</strong></div><time>{formatCatalogDate(item.updatedAt)}</time><ArrowRight size={18} /></Link>)}</div></section>}
    <section className="institution-cta shell"><div><span className="section-kicker">Contenido adaptado a tu institución</span><h2>Protocolos locales. Un solo acceso.</h2><p>Escanea el QR institucional o ingresa para consultar recursos exclusivos y actualizaciones propias.</p></div><Button asChild size="lg"><Link href="/acceso-institucional">Acceder a mi institución <ArrowRight /></Link></Button></section>
    <section className="brand-signature shell" aria-label="Marcas del ecosistema Infectonorte"><span>Un ecosistema de conocimiento clínico</span><EcosystemBrand /></section>
    <footer className="footer"><div className="shell"><span>© 2026 Infectonorte HUB</span><span>Conocimiento clínico. Disponible cuando lo necesitas.</span></div></footer>
  </main>;
}

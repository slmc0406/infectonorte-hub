"use client";

import { FileText, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResourceCard, resourceKindLabel } from "@/components/resource-card";
import type { CatalogResource } from "@/lib/catalog";
import { useContentSearch } from "@/lib/use-content-search";

type InstitutionResource = {
  id: string; title: string; description: string; type: string; category: string; version: number;
  fileName: string; updatedAt: number; thumbKey?: string | null; visibility: string;
};

function asCatalog(resource: InstitutionResource) {
  return { ...resource, status: "published", fileSize: 0 } as CatalogResource;
}

export function InstitutionCatalog({ resources }: { resources: InstitutionResource[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const contentHits = useContentSearch(query);
  const own = resources.filter((item) => item.visibility === "institution");
  const general = resources.filter((item) => item.visibility !== "institution");
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    general.forEach((item) => counts.set(item.category, (counts.get(item.category) || 0) + 1));
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"));
  }, [general]);
  const match = (resource: InstitutionResource) => {
    const term = query.trim().toLowerCase();
    return !term || contentHits.has(resource.id) || `${resource.title} ${resource.description} ${resource.type} ${resourceKindLabel(resource.type)} ${resource.category} ${resource.fileName}`.toLowerCase().includes(term);
  };
  const ownFiltered = own.filter(match);
  const generalFiltered = general.filter((resource) => (category === "Todos" || resource.category === category) && match(resource));
  const isFiltering = Boolean(query || category !== "Todos");

  return <>
    <div className="institution-catalog-controls">
      <div className="internal-search"><Search aria-hidden="true" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por tema, antibiótico o microorganismo…" aria-label="Buscar dentro de esta institución" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Limpiar búsqueda"><X /></button>}</div>
    </div>
    {own.length > 0 && <section className="institution-own" aria-labelledby="own-heading">
      <div className="section-heading institution-results-heading"><div><span className="section-kicker">Para tu institución</span><h2 id="own-heading">{ownFiltered.length} {ownFiltered.length === 1 ? "documento propio" : "documentos propios"}</h2></div></div>
      {ownFiltered.length ? <div className="all-resources">{ownFiltered.map((resource) => <ResourceCard resource={asCatalog(resource)} directFile snippet={query ? contentHits.get(resource.id)?.snippet : undefined} key={resource.id} />)}</div> : <p className="institution-empty-note">Sin coincidencias en los documentos de tu institución.</p>}
    </section>}
    <section aria-labelledby="general-heading" className="institution-general">
      <div className="section-heading institution-results-heading"><div><span className="section-kicker">Biblioteca general</span><h2 id="general-heading" role="status" aria-live="polite">{generalFiltered.length} {generalFiltered.length === 1 ? "recurso disponible" : "recursos disponibles"}</h2></div>
        <label className="area-select"><span>Tema</span><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filtrar por tema"><option value="Todos">Todos los temas ({general.length})</option>{categories.map(([name, count]) => <option key={name} value={name}>{name} ({count})</option>)}</select></label>
      </div>
      {generalFiltered.length ? <div className="all-resources">{generalFiltered.map((resource) => <ResourceCard resource={asCatalog(resource)} directFile snippet={query ? contentHits.get(resource.id)?.snippet : undefined} key={resource.id} />)}</div> : <div className="admin-card empty-admin"><FileText /><h2>No encontramos coincidencias</h2><p>Prueba con otro término o tema.</p>{isFiltering && <Button variant="outline" onClick={() => { setQuery(""); setCategory("Todos"); }}>Limpiar filtros</Button>}</div>}
    </section>
  </>;
}

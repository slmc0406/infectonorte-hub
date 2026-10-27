"use client";
import Link from "next/link";
import { FileText, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CatalogResource } from "@/lib/catalog";
import { formatCatalogDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Highlighted, ResourceCard, resourceKindLabel } from "@/components/resource-card";
import { useContentSearch } from "@/lib/use-content-search";

const KINDS = [
  { value: "Todos", label: "Todo" },
  { value: "Documento", label: "Guías" },
  { value: "Protocolo", label: "Algoritmos" },
];

export function SearchExperience({ resources, compact = false, initialArea = "Todos" }: { resources: CatalogResource[]; compact?: boolean; initialArea?: string }) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState(initialArea);
  const [kind, setKind] = useState("Todos");
  const inputRef = useRef<HTMLInputElement>(null);
  const contentHits = useContentSearch(query);
  const resultsId = compact ? "home-search-results" : "library-search-results";
  const areas = useMemo(() => {
    const counts = new Map<string, number>();
    resources.forEach((item) => counts.set(item.category, (counts.get(item.category) || 0) + 1));
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"));
  }, [resources]);
  const kindCounts = useMemo(() => {
    const counts = new Map<string, number>();
    resources.forEach((item) => counts.set(item.type, (counts.get(item.type) || 0) + 1));
    return counts;
  }, [resources]);
  const results = useMemo(() => {
    const term = query.toLowerCase().trim();
    const filtered = resources.filter((item) => {
      const matchesArea = area === "Todos" || item.category === area;
      const matchesKind = kind === "Todos" || item.type === kind;
      const haystack = [item.title, item.description, item.category, item.type, resourceKindLabel(item.type), item.fileName].join(" ").toLowerCase();
      return matchesArea && matchesKind && (!term || haystack.includes(term) || contentHits.has(item.id));
    });
    if (!term) return filtered;
    const titleMatch = (item: CatalogResource) => `${item.title} ${item.category}`.toLowerCase().includes(term);
    return [...filtered].sort((a, b) => Number(titleMatch(b)) - Number(titleMatch(a)) || (contentHits.get(b.id)?.rank || 0) - (contentHits.get(a.id)?.rank || 0));
  }, [query, area, kind, resources, contentHits]);
  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape" && document.activeElement === inputRef.current) setQuery("");
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);
  const isFiltering = Boolean(query || area !== "Todos" || kind !== "Todos");
  function clearFilters() { setQuery(""); setArea("Todos"); setKind("Todos"); }
  const searchBox = <div className="search-box"><Search className="search-icon" aria-hidden="true" /><Input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar algoritmos, microorganismos, antibióticos…" aria-label="Buscar contenido clínico" />{query && <button type="button" className="clear-search" onClick={() => setQuery("")} aria-label="Limpiar búsqueda"><X size={16} /></button>}<kbd className="search-shortcut" aria-label="Atajo Comando K">⌘ K</kbd></div>;

  if (compact) {
    return <div className="search-experience compact">
      {searchBox}
      {query && <div className="search-results" id={resultsId}><div className="results-heading" role="status" aria-live="polite"><span>{results.length} resultados</span><span>Contenido publicado</span></div>{results.map((resource) => <Link href={`/recursos/${resource.id}`} className="result-row" key={resource.id}><div><div className="result-meta"><Badge variant="secondary">{resourceKindLabel(resource.type)}</Badge><span>{resource.category}</span></div><h3>{resource.title}</h3>{contentHits.get(resource.id)?.snippet ? <p><Highlighted text={contentHits.get(resource.id)!.snippet} /></p> : resource.description && <p>{resource.description}</p>}</div><span className="status-dot">Publicado</span></Link>)}{!results.length && <div className="empty-result"><h3>No encontramos coincidencias</h3><p>Prueba otro término.</p><Button size="sm" variant="outline" onClick={() => setQuery("")}>Limpiar búsqueda</Button></div>}</div>}
    </div>;
  }

  return <div className="search-experience">
    {searchBox}
    <div className="library-filters">
      <div className="kind-toggle" role="group" aria-label="Tipo de contenido">
        {KINDS.map((item) => {
          const count = item.value === "Todos" ? resources.length : kindCounts.get(item.value) || 0;
          return <button type="button" key={item.value} className={item.value === kind ? "is-active" : ""} aria-pressed={item.value === kind} onClick={() => setKind(item.value)}>{item.label}<span>{count}</span></button>;
        })}
      </div>
      <label className="area-select"><span>Tema</span>
        <select value={area} onChange={(e) => setArea(e.target.value)} aria-label="Filtrar por tema">
          <option value="Todos">Todos los temas ({resources.length})</option>
          {areas.map(([name, count]) => <option key={name} value={name}>{name} ({count})</option>)}
        </select>
      </label>
      {isFiltering && <button type="button" className="clear-filters" onClick={clearFilters}><X size={14} />Limpiar</button>}
    </div>
    <div className="library-count" role="status" aria-live="polite"><strong>{results.length} {results.length === 1 ? "recurso" : "recursos"}{isFiltering ? " encontrados" : " publicados"}</strong><span>{resources[0] ? `Actualizada ${formatCatalogDate(resources[0].updatedAt)}` : "Sin contenido publicado"}</span></div>
    {results.length ? <div className="all-resources">{results.map((resource) => <ResourceCard resource={resource} snippet={query ? contentHits.get(resource.id)?.snippet : undefined} key={resource.id} />)}</div> : resources.length ? <div className="catalog-empty"><FileText /><h3>No encontramos coincidencias</h3><p>Prueba otro término o elimina los filtros.</p><Button size="sm" variant="outline" onClick={clearFilters}>Limpiar filtros</Button></div> : <div className="catalog-empty"><FileText /><h3>Aún no hay recursos generales publicados</h3><p>Cuando el administrador publique el primero, estará disponible inmediatamente en esta biblioteca.</p></div>}
  </div>;
}

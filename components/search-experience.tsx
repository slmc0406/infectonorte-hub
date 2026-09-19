"use client";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CatalogResource } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchExperience({ resources, compact = false, initialArea = "Todos" }: { resources: CatalogResource[]; compact?: boolean; initialArea?: string }) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState(initialArea);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsId = compact ? "home-search-results" : "library-search-results";
  const areas = ["Todos", ...Array.from(new Set(resources.map((item) => item.category))).sort()];
  const results = useMemo(() => {
    const term = query.toLowerCase().trim();
    return resources.filter((item) => {
      const matchesArea = area === "Todos" || item.category === area;
      const haystack = [item.title, item.description, item.category, item.type, item.fileName].join(" ").toLowerCase();
      return matchesArea && (!term || haystack.includes(term));
    });
  }, [query, area, resources]);
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
  const isFiltering = Boolean(query || area !== "Todos");
  return <div className={compact ? "search-experience compact" : "search-experience"}>
    <div className="search-box"><Search className="search-icon" aria-hidden="true" /><Input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar algoritmos, microorganismos, antibióticos…" aria-label="Buscar contenido clínico" />{query && <button type="button" className="clear-search" onClick={() => setQuery("")} aria-label="Limpiar búsqueda"><X size={16} /></button>}<kbd className="search-shortcut" aria-label="Atajo Comando K">⌘ K</kbd></div>
    {!compact && <div className="filter-row" role="group" aria-label="Filtros por área"><SlidersHorizontal size={16} aria-hidden="true" />{areas.map((item) => <Button key={item} variant={item === area ? "default" : "outline"} size="sm" aria-pressed={item === area} onClick={() => setArea(item)}>{item}</Button>)}</div>}
    {isFiltering && <div className="search-results" id={resultsId}><div className="results-heading" role="status" aria-live="polite"><span>{results.length} resultados</span><span>Contenido publicado</span></div>{results.map((resource) => <Link href={`/recursos/${resource.id}`} className="result-row" key={resource.id}><div><div className="result-meta"><Badge variant="secondary">{resource.type}</Badge><span>{resource.category}</span></div><h3>{resource.title}</h3><p>{resource.description || resource.fileName}</p></div><span className="status-dot">Publicado</span></Link>)}{!results.length && <div className="empty-result"><h3>No encontramos coincidencias</h3><p>Prueba otro término o elimina los filtros.</p><Button size="sm" variant="outline" onClick={() => { setQuery(""); setArea("Todos"); }}>Limpiar filtros</Button></div>}</div>}
  </div>;
}

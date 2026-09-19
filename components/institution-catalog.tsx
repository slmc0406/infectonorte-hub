"use client";

import Link from "next/link";
import { ArrowRight, FileText, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type InstitutionResource = { id: string; title: string; description: string; type: string; category: string; version: number; fileName: string; updatedAt: number };

export function InstitutionCatalog({ resources }: { resources: InstitutionResource[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const categories = ["Todos", ...Array.from(new Set(resources.map((item) => item.category))).sort()];
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesCategory = category === "Todos" || resource.category === category;
      const matchesQuery = !term || `${resource.title} ${resource.description} ${resource.type} ${resource.category} ${resource.fileName}`.toLowerCase().includes(term);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, resources]);

  return <><div className="institution-catalog-controls"><div className="internal-search"><Search aria-hidden="true" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar dentro de esta institución…" aria-label="Buscar dentro de esta institución" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Limpiar búsqueda"><X /></button>}</div><div className="institution-filters" role="group" aria-label="Filtrar por categoría">{categories.map((item) => <Button size="sm" variant={category === item ? "default" : "outline"} aria-pressed={category === item} key={item} onClick={() => setCategory(item)}>{item}</Button>)}</div></div><div className="section-heading institution-results-heading"><div><span className="section-kicker">Biblioteca vigente</span><h2 role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "recurso disponible" : "recursos disponibles"}</h2></div></div>{filtered.length ? <div className="resource-grid institution-resources">{filtered.map((resource) => <article className="resource-card" key={resource.id}><div className="resource-card-top"><span className="resource-type"><FileText />{resource.type}</span><span>v{resource.version}</span></div><div className="resource-card-body"><span className="resource-category">{resource.category}</span><h3>{resource.title}</h3><p>{resource.description || resource.fileName}</p><Button variant="ghost" asChild><Link href={`/api/resources/${resource.id}`} target="_blank" rel="noreferrer">Abrir recurso <ArrowRight /></Link></Button></div></article>)}</div> : <div className="admin-card empty-admin"><FileText /><h2>No encontramos coincidencias</h2><p>Prueba con otro término o categoría.</p><Button variant="outline" onClick={() => { setQuery(""); setCategory("Todos"); }}>Limpiar filtros</Button></div>}</>;
}

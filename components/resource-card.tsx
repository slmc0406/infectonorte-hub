import Link from "next/link";
import { BarChart3, FileText, Presentation } from "lucide-react";
import type { CatalogResource } from "@/lib/catalog";
import { formatCatalogDate } from "@/lib/format";

function ResourceGlyph({ type }: { type: string }) {
  if (type === "Presentación") return <Presentation size={22} />;
  if (type === "Dashboard") return <BarChart3 size={22} />;
  return <FileText size={22} />;
}

export function resourceKindLabel(type: string) {
  if (type === "Documento") return "Guía";
  if (type === "Protocolo") return "Algoritmo";
  return type;
}

export function ResourceCard({ resource, directFile = false }: { resource: CatalogResource; directFile?: boolean }) {
  const body = <>
    <div className="resource-thumb">
      {resource.thumbKey
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={`/api/resources/${resource.id}/thumb`} alt={`Vista previa de ${resource.title}`} loading="lazy" decoding="async" />
        : <span className="resource-thumb-fallback"><ResourceGlyph type={resource.type} /></span>}
    </div>
    <div className="resource-body">
      <div className="resource-meta">
        <span className={`resource-kind kind-${resource.type === "Protocolo" ? "algorithm" : "guide"}`}>{resourceKindLabel(resource.type)}</span>
        <span className="resource-category">{resource.category}</span>
      </div>
      <h3>{resource.title}</h3>
      {resource.description && <p>{resource.description}</p>}
      <div className="resource-footer"><span>v{resource.version} · {formatCatalogDate(resource.updatedAt)}</span></div>
    </div>
  </>;
  return directFile
    ? <a href={`/api/resources/${resource.id}`} target="_blank" rel="noreferrer" className="resource-card">{body}</a>
    : <Link href={`/recursos/${resource.id}`} className="resource-card">{body}</Link>;
}

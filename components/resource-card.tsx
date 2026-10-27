import Link from "next/link";
import { BarChart3, FileText, Presentation } from "lucide-react";
import type { CatalogResource } from "@/lib/catalog";
import { formatCatalogDate } from "@/lib/format";

function ResourceGlyph({ type }: { type: string }) {
  if (type === "Presentación") return <Presentation size={30} />;
  if (type === "Dashboard") return <BarChart3 size={30} />;
  return <FileText size={30} />;
}

export function resourceKindLabel(type: string) {
  if (type === "Documento") return "Guía";
  if (type === "Protocolo") return "Algoritmo";
  return type;
}

export function ResourceCard({ resource }: { resource: CatalogResource }) {
  return <Link href={`/recursos/${resource.id}`} className="resource-card">
    <div className="resource-thumb">
      {resource.thumbKey
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={`/api/resources/${resource.id}/thumb`} alt={`Vista previa de ${resource.title}`} loading="lazy" decoding="async" />
        : <span className="resource-thumb-fallback"><ResourceGlyph type={resource.type} /></span>}
      <span className={`resource-kind kind-${resource.type === "Protocolo" ? "algorithm" : "guide"}`}>{resourceKindLabel(resource.type)}</span>
    </div>
    <div className="resource-body">
      <span className="resource-category">{resource.category}</span>
      <h3>{resource.title}</h3>
      {resource.description && <p>{resource.description}</p>}
      <div className="resource-footer"><span>v{resource.version} · {formatCatalogDate(resource.updatedAt)}</span></div>
    </div>
  </Link>;
}

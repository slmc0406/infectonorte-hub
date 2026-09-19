import Link from "next/link";
import { ArrowUpRight, BarChart3, FileText, Presentation } from "lucide-react";
import { CatalogResource, formatCatalogDate } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";

function ResourceGlyph({ type }: { type: string }) {
  if (type === "Presentación") return <Presentation size={20} />;
  if (type === "Dashboard") return <BarChart3 size={20} />;
  return <FileText size={20} />;
}

export function ResourceCard({ resource }: { resource: CatalogResource }) {
  return <Link href={`/recursos/${resource.id}`} className="resource-card"><div className="resource-card-top"><span className="resource-icon"><ResourceGlyph type={resource.type} /></span><ArrowUpRight size={18} className="resource-arrow" /></div><div className="resource-labels"><Badge variant="secondary">{resource.type}</Badge><span>{resource.category}</span></div><h3>{resource.title}</h3><p>{resource.description || resource.fileName}</p><div className="resource-footer"><span className="status-dot">Publicado</span><span>v{resource.version} · {formatCatalogDate(resource.updatedAt)}</span></div></Link>;
}

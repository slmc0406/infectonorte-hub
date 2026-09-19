import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Download, ExternalLink, FileText, UserRoundCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { formatCatalogDate, getPublicResource } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = await getPublicResource(slug);
  if (!resource) notFound();
  return <main><SiteHeader /><article className="resource-detail shell"><Link className="back-link" href="/biblioteca"><ArrowLeft size={16} /> Volver a biblioteca</Link><div className="resource-detail-grid"><div><div className="resource-labels"><Badge>{resource.type}</Badge><span>{resource.category}</span></div><h1>{resource.title}</h1><p className="lead">{resource.description || resource.fileName}</p><div className="detail-actions"><Button asChild><Link href={`/api/resources/${resource.id}`} target="_blank" rel="noreferrer"><ExternalLink /> Ver recurso</Link></Button><Button variant="outline" asChild><a href={`/api/resources/${resource.id}`} download><Download /> Descargar</a></Button></div><div className="clinical-note"><strong>CONTROL DOCUMENTAL</strong><p>Verifica la versión, la fecha de actualización y la aplicabilidad institucional antes de utilizar este recurso.</p></div></div><aside className="metadata-card"><div className="status-large"><span /> Publicado</div><dl><dt>Versión</dt><dd>{resource.version}</dd><dt>Actualización</dt><dd>{formatCatalogDate(resource.updatedAt)}</dd><dt>Tipo</dt><dd>{resource.type}</dd><dt>Categoría</dt><dd>{resource.category}</dd></dl><hr /><div className="person"><UserRoundCheck /><div><span>Publicado por</span><strong>Equipo Infectonorte</strong></div></div><div className="person"><FileText /><div><span>Archivo</span><strong>{resource.fileName}</strong></div></div><div className="person"><Calendar /><div><span>Creación</span><strong>{formatCatalogDate(resource.createdAt)}</strong></div></div></aside></div></article></main>;
}

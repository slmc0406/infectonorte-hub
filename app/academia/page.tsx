import Link from "next/link";
import { CalendarDays, PlayCircle, UserRound } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { demoNotice, resources } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AcademiaPage() {
  const talk = resources.find((r) => r.type === "Presentación")!;
  return <main><SiteHeader /><div className="demo-ribbon"><span>{demoNotice}</span></div><section className="page-hero shell"><span className="section-kicker">Academia Infectonorte</span><h1>Ideas clínicas que siguen circulando.</h1><p>Presentaciones, sesiones y material académico organizados para volver a consultar, enseñar y compartir.</p></section><section className="academy-feature shell"><div className="academy-visual"><span>INFECTONORTE</span><strong>Uso racional de<br />antimicrobianos<br />en UCI</strong><div className="academy-wave" /></div><div className="academy-copy"><Badge>Presentación destacada</Badge><h2>{talk.title}</h2><p>{talk.summary}</p><ul><li><UserRound /> Equipo PROA Infectonorte</li><li><CalendarDays /> 24 julio 2026</li><li><PlayCircle /> Presentación + video</li></ul><Button asChild><Link href={`/recursos/${talk.slug}`}>Ver presentación</Link></Button></div></section><section className="shell academic-list"><div className="section-heading"><div><span className="section-kicker">Biblioteca académica</span><h2>Sesiones recientes</h2></div></div>{["Vacunación complementaria en Colombia", "Interpretación práctica del antibiograma", "Prevención de IAAS en cuidado crítico"].map((title, i) => <article key={title}><span>0{i + 1}</span><div><Badge variant="secondary">Sesión clínica</Badge><h3>{title}</h3><p>Material demostrativo · Infectonorte Academia · 2026</p></div><Button variant="outline">Ver material</Button></article>)}</section></main>;
}

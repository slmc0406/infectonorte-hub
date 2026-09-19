import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { EcosystemBrand } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <main className="not-found-page"><section><EcosystemBrand compact /><FileQuestion aria-hidden="true" /><span className="section-kicker">Contenido no encontrado</span><h1>Este enlace no está disponible.</h1><p>Puede que el recurso haya sido archivado, el código institucional no exista o el enlace esté incompleto.</p><div><Button asChild><Link href="/"><ArrowLeft /> Volver al inicio</Link></Button><Button variant="outline" asChild><Link href="/biblioteca">Ir a la biblioteca</Link></Button></div></section></main>;
}

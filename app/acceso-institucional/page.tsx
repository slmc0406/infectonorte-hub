"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Building2 } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InstitutionalAccessPage() {
  const [code, setCode] = useState("");
  function submit(event: FormEvent) {
    event.preventDefault();
    const slug = code.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (slug) window.location.href = `/i/${slug}`;
  }
  return <main className="institution-access-page"><section><Brand /><div className="access-icon"><Building2 /></div><span className="section-kicker">Acceso institucional</span><h1>Ingresa el código de tu institución</h1><p>También puedes abrir el portal directamente escaneando el QR entregado por Infectonorte.</p><form onSubmit={submit}><Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Ej. clinica-san-jose" aria-label="Código institucional" required /><Button type="submit">Continuar <ArrowRight /></Button></form></section></main>;
}

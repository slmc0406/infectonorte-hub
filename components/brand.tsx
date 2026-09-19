import Link from "next/link";
import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="brand" aria-label="Infectonorte HUB — Inicio"><Image className="brand-logo" src="/brand/infectonorte.svg" alt="Infectonorte - Especialistas en Infecciones" width={190} height={47} priority />{!compact && <span className="brand-product">HUB</span>}</Link>;
}

export function EcosystemBrand({ compact = false, inverse = false, showHub = true }: { compact?: boolean; inverse?: boolean; showHub?: boolean }) {
  return <Link href="/" className={`ecosystem-brand${compact ? " is-compact" : ""}${inverse ? " is-inverse" : ""}`} aria-label="Infectonorte, Infectoped, Familias con Vacunas e Infectonorte HUB — Inicio">
    <span className="ecosystem-logo ecosystem-infectonorte"><Image src="/brand/infectonorte.svg" alt="Infectonorte" width={630} height={155} priority /></span>
    <span className="ecosystem-separator" aria-hidden="true" />
    <span className="ecosystem-logo ecosystem-infectoped"><Image src="/brand/infectoped.svg" alt="Infectoped" width={640} height={255} priority /></span>
    <span className="ecosystem-separator" aria-hidden="true" />
    <span className="ecosystem-logo ecosystem-familias"><Image src="/brand/familias-con-vacunas.png" alt="Familias con Vacunas" width={2048} height={1145} unoptimized priority /></span>
    {showHub && <><span className="ecosystem-separator" aria-hidden="true" /><span className="ecosystem-hub"><strong>HUB</strong><small>Conocimiento clínico</small></span></>}
  </Link>;
}

export function HubBrand() {
  return <Link href="/" className="hub-brand" aria-label="Infectonorte HUB — Inicio"><strong>HUB</strong><span>Conocimiento clínico</span></Link>;
}

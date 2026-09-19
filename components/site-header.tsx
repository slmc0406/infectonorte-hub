"use client";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { EcosystemBrand, HubBrand } from "./brand";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);
  const current = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  return <header className="site-header"><div className="ecosystem-ribbon"><div className="shell"><EcosystemBrand showHub={false} /></div></div><div className="shell header-inner"><HubBrand /><nav id="main-navigation" className={open ? "main-nav is-open" : "main-nav"} aria-label="Navegación principal"><Link href="/biblioteca" onClick={() => setOpen(false)} aria-current={current("/biblioteca") ? "page" : undefined}>Biblioteca</Link><Link href="/academia" onClick={() => setOpen(false)} aria-current={current("/academia") ? "page" : undefined}>Academia</Link><Link href="/acceso-institucional" onClick={() => setOpen(false)} aria-current={current("/acceso-institucional") ? "page" : undefined}>Mi institución</Link><a href="/admin" target="_top">Administración</a></nav><div className="header-actions"><Button variant="ghost" size="icon" asChild className="desktop-search"><Link href="/biblioteca" aria-label="Buscar"><Search size={19} /></Link></Button><Button asChild className="institution-button"><Link href="/acceso-institucional">Acceso institucional</Link></Button><Button variant="ghost" size="icon" className="menu-button" onClick={() => setOpen(!open)} aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-controls="main-navigation" aria-expanded={open}>{open ? <X /> : <Menu />}</Button></div></div></header>;
}

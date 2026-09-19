import { redirect } from "next/navigation";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { getAdminUser } from "@/lib/admin-auth";
import { EcosystemBrand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdminUser()) redirect("/admin");
  const { error } = await searchParams;
  return <main className="admin-login-page"><section className="admin-login-card"><EcosystemBrand compact /><div className="admin-login-heading"><span><LockKeyhole /></span><div><h1>Administración</h1><p>Acceso exclusivo para el equipo autorizado de Infectonorte HUB.</p></div></div>{error && <div className="admin-alert" role="alert">Correo o contraseña incorrectos.</div>}<form action="/api/admin-login" method="post" className="admin-login-form"><label htmlFor="email">Correo autorizado</label><Input id="email" name="email" type="email" autoComplete="username" required /><label htmlFor="password">Contraseña</label><Input id="password" name="password" type="password" autoComplete="current-password" required minLength={12} /><Button type="submit">Ingresar al panel</Button></form><Link href="/">Volver al HUB</Link></section></main>;
}

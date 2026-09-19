import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { LogOut } from "lucide-react";
import { InstitutionLogin } from "@/components/institution-login";
import { InstitutionCatalog } from "@/components/institution-catalog";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { runtimeEnv } from "@/lib/runtime";
import { readInstitutionSession } from "@/lib/security";
import { supabaseAdmin, throwIfError } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function InstitutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const client = supabaseAdmin();
  const { data: institution, error: institutionError } = await client.from("institutions").select("id,name,city,slug")
    .eq("slug", slug).eq("status", "active").maybeSingle();
  throwIfError(institutionError);
  if (!institution) notFound();
  const jar = await cookies();
  const sessionId = await readInstitutionSession(jar.get("hub_institution_session")?.value, runtimeEnv().INSTITUTION_SESSION_SECRET || "");
  if (sessionId !== institution.id) return <InstitutionLogin institution={institution} />;
  const { data: rows, error: resourcesError } = await client.from("resources").select("*").eq("status", "published")
    .or(`visibility.eq.general,institution_id.eq.${institution.id}`).order("updated_at", { ascending: false });
  throwIfError(resourcesError);
  const resources = (rows || []).map((row) => ({ id: row.id, title: row.title, description: row.description, type: row.type, category: row.category, version: row.version, fileName: row.file_name, updatedAt: row.updated_at }));
  return <main className="institution-dashboard"><header className="institution-header"><div className="shell"><Brand /><div className="institution-context"><div className="demo-institution-logo small">{institution.name.slice(0, 2).toUpperCase()}</div><div><span>Portal de</span><strong>{institution.name}</strong></div></div><div className="institution-tools"><form action="/api/institution-logout" method="post"><input type="hidden" name="slug" value={institution.slug} /><Button variant="ghost" size="sm" type="submit"><LogOut /> Salir</Button></form></div></div></header><section className="institution-welcome shell"><div><span className="section-kicker">Portal clínico institucional</span><h1>Contenido para {institution.name}</h1><p>Protocolos generales y recursos asignados a tu institución.</p></div></section><section className="shell institution-content"><div className="institution-main"><InstitutionCatalog resources={resources} /></div></section></main>;
}

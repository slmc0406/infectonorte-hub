import { cookies } from "next/headers";
import { runtimeEnv } from "@/lib/runtime";
import { readInstitutionSession } from "@/lib/security";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Búsqueda por contenido de los documentos. Solo devuelve lo que el visitante puede ver. */
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 100);
  if (q.length < 3) return Response.json({ hits: [] });
  const jar = await cookies();
  const institutionId = await readInstitutionSession(jar.get("hub_institution_session")?.value, runtimeEnv().INSTITUTION_SESSION_SECRET || "");
  const { data, error } = await supabaseAdmin().rpc("hub_search", { q, inst: institutionId || null });
  if (error) return Response.json({ hits: [] }, { status: 200 });
  const hits = (data || []).map((row: { id: string; rank: number; snippet: string }) => ({
    id: row.id, rank: row.rank, snippet: String(row.snippet || "").replace(/\s+/g, " ").trim(),
  }));
  return Response.json({ hits }, { headers: { "cache-control": "private, max-age=30" } });
}

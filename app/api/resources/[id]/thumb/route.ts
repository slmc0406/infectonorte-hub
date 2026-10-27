import { cookies } from "next/headers";
import { getAdminUser } from "@/lib/admin-auth";
import { runtimeEnv } from "@/lib/runtime";
import { readInstitutionSession } from "@/lib/security";
import { downloadStoredFile, mapResource, supabaseAdmin, throwIfError } from "@/lib/supabase";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { data, error } = await supabaseAdmin().from("resources").select("*").eq("id", id).maybeSingle();
  throwIfError(error);
  const resource = data ? mapResource(data) : null;
  if (!resource || resource.status !== "published" || !resource.thumbKey) return new Response("No encontrado", { status: 404 });

  const isGeneral = resource.visibility === "general";
  if (!isGeneral) {
    const admin = await getAdminUser();
    if (!admin) {
      const secret = runtimeEnv().INSTITUTION_SESSION_SECRET || "";
      const jar = await cookies();
      const institutionId = await readInstitutionSession(jar.get("hub_institution_session")?.value, secret);
      if (!institutionId || resource.institutionId !== institutionId) return new Response("No autorizado", { status: 401 });
    }
  }

  const object = await downloadStoredFile(String(resource.thumbKey)).catch(() => null);
  if (!object) return new Response("No encontrado", { status: 404 });
  return new Response(await object.arrayBuffer(), {
    headers: {
      "content-type": "image/jpeg",
      "cache-control": isGeneral ? "public, max-age=86400, stale-while-revalidate=604800" : "private, max-age=3600",
    },
  });
}

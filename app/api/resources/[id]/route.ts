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
  if (!resource || resource.status !== "published") return new Response("No encontrado", { status: 404 });

  const admin = await getAdminUser();
  if (!admin) {
    const secret = runtimeEnv().INSTITUTION_SESSION_SECRET || "";
    const jar = await cookies();
    const institutionId = await readInstitutionSession(jar.get("hub_institution_session")?.value, secret);
    const allowed = resource.visibility === "general" || (institutionId && resource.institutionId === institutionId);
    if (!allowed) return new Response("No autorizado", { status: 401 });
  }

  const object = await downloadStoredFile(String(resource.fileKey));
  if (!object) return new Response("No encontrado", { status: 404 });
  const bytes = await object.arrayBuffer();
  const checksum = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  if (resource.checksum && resource.checksum !== checksum) {
    return new Response("El archivo no superó la verificación de integridad", { status: 503 });
  }
  return new Response(bytes, {
    headers: {
      "content-type": String(resource.mimeType),
      "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(String(resource.fileName))}`,
      "cache-control": "private, max-age=300",
    },
  });
}

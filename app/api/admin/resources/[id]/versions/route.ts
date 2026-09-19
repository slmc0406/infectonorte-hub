import { getAdminUser } from "@/lib/admin-auth";
import { mapVersion, supabaseAdmin, throwIfError } from "@/lib/supabase";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await context.params;
  const { data, error } = await supabaseAdmin().from("resource_versions").select("*").eq("resource_id", id).order("version", { ascending: false });
  throwIfError(error);
  return Response.json({ versions: (data || []).map((row) => mapVersion(row)) });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await context.params;
  const payload = await request.json().catch(() => ({})) as { version?: number };
  if (!Number.isInteger(payload.version) || Number(payload.version) < 1) return Response.json({ error: "Selecciona una versión válida." }, { status: 400 });
  const client = supabaseAdmin();
  const [resourceResult, selectedResult] = await Promise.all([
    client.from("resources").select("title,version").eq("id", id).maybeSingle(),
    client.from("resource_versions").select("*").eq("resource_id", id).eq("version", payload.version).maybeSingle(),
  ]);
  throwIfError(resourceResult.error); throwIfError(selectedResult.error);
  const resource = resourceResult.data;
  const selected = selectedResult.data ? mapVersion(selectedResult.data) : null;
  if (!resource || !selected) return Response.json({ error: "Versión no encontrada." }, { status: 404 });
  const nextVersion = resource.version + 1;
  const now = Date.now();
  const { error } = await client.from("resources").update({ version: nextVersion, file_key: selected.fileKey, file_name: selected.fileName, mime_type: selected.mimeType, file_size: selected.fileSize, checksum: selected.checksum, updated_at: now }).eq("id", id); throwIfError(error);
  const { error: versionError } = await client.from("resource_versions").insert({ id: crypto.randomUUID(), resource_id: id, version: nextVersion, file_key: selected.fileKey, file_name: selected.fileName, mime_type: selected.mimeType, file_size: selected.fileSize, checksum: selected.checksum, created_by: user.email, created_at: now }); throwIfError(versionError);
  const { error: auditError } = await client.from("audit_log").insert({ id: crypto.randomUUID(), actor_email: user.email, action: "restored", entity_type: "resource", entity_id: id, detail: `${resource.title} · restaurada v${payload.version} como v${nextVersion}`, created_at: now }); throwIfError(auditError);
  return Response.json({ ok: true, version: nextVersion });
}

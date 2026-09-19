import { getAdminUser } from "@/lib/admin-auth";
import { validateClinicalFile } from "@/lib/file-validation";
import { removeStoredFile, supabaseAdmin, throwIfError, uploadStoredFile } from "@/lib/supabase";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await context.params;
  const payload = await request.json().catch(() => ({})) as { title?: string; description?: string; type?: string; category?: string; status?: string; visibility?: string; institutionId?: string | null };
  const client = supabaseAdmin();
  const { data: currentRow, error: currentError } = await client.from("resources").select("*").eq("id", id).maybeSingle();
  throwIfError(currentError);
  const current = currentRow ? { title: currentRow.title, description: currentRow.description, type: currentRow.type, category: currentRow.category, status: currentRow.status, visibility: currentRow.visibility, institutionId: currentRow.institution_id as string | null } : null;
  if (!current) return Response.json({ error: "Recurso no encontrado." }, { status: 404 });
  const title = payload.title?.trim() || current.title;
  const description = payload.description?.trim() ?? current.description;
  const type = payload.type?.trim() || current.type;
  const category = payload.category?.trim() || current.category;
  const status = ["draft", "published", "archived"].includes(payload.status || "") ? payload.status! : current.status;
  const visibility = payload.visibility === "institution" ? "institution" : payload.visibility === "general" ? "general" : current.visibility;
  const institutionId = visibility === "institution" ? (payload.institutionId || current.institutionId) : null;
  if (visibility === "institution" && !institutionId) return Response.json({ error: "Selecciona una institución." }, { status: 400 });
  const now = Date.now();
  const { error } = await client.from("resources").update({ title, description, type, category, status, visibility, institution_id: institutionId, updated_at: now }).eq("id", id); throwIfError(error);
  const { error: auditError } = await client.from("audit_log").insert({ id: crypto.randomUUID(), actor_email: user.email, action: "updated", entity_type: "resource", entity_id: id, detail: `${title} · ${status}`, created_at: now }); throwIfError(auditError);
  return Response.json({ ok: true });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await context.params;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Selecciona un archivo." }, { status: 400 });
  let validated;
  try { validated = await validateClinicalFile(file); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Archivo no válido." }, { status: 400 }); }
  const client = supabaseAdmin();
  const { data: currentRow, error: currentError } = await client.from("resources").select("title,version,file_key,checksum").eq("id", id).maybeSingle();
  throwIfError(currentError);
  const current = currentRow ? { title: currentRow.title, version: currentRow.version, fileKey: currentRow.file_key, checksum: currentRow.checksum } : null;
  if (!current) return Response.json({ error: "Recurso no encontrado." }, { status: 404 });
  if (current.checksum && current.checksum === validated.checksum) return Response.json({ error: "Este archivo es idéntico a la versión actual." }, { status: 409 });
  const nextVersion = current.version + 1;
  const fileKey = `resources/${id}/v${nextVersion}-${validated.safeName}`;
  await uploadStoredFile(fileKey, validated.bytes, validated.mimeType);
  const now = Date.now();
  try {
    const { error } = await client.from("resources").update({ version: nextVersion, file_key: fileKey, file_name: file.name, mime_type: validated.mimeType, file_size: file.size, checksum: validated.checksum, updated_at: now }).eq("id", id); throwIfError(error);
    const { error: versionError } = await client.from("resource_versions").insert({ id: crypto.randomUUID(), resource_id: id, version: nextVersion, file_key: fileKey, file_name: file.name, mime_type: validated.mimeType, file_size: file.size, checksum: validated.checksum, created_by: user.email, created_at: now }); throwIfError(versionError);
    const { error: auditError } = await client.from("audit_log").insert({ id: crypto.randomUUID(), actor_email: user.email, action: "replaced", entity_type: "resource", entity_id: id, detail: `${current.title} · v${nextVersion}`, created_at: now }); throwIfError(auditError);
  } catch (error) {
    await removeStoredFile(fileKey).catch(() => undefined);
    throw error;
  }
  return Response.json({ ok: true, version: nextVersion });
}

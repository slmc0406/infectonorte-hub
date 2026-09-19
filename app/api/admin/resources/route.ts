import { getAdminUser } from "@/lib/admin-auth";
import { validateClinicalFile } from "@/lib/file-validation";
import { removeStoredFile, supabaseAdmin, throwIfError, uploadStoredFile } from "@/lib/supabase";

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const title = String(form.get("title") || "").trim();
  const description = String(form.get("description") || "").trim();
  const type = String(form.get("type") || "Documento").trim();
  const category = String(form.get("category") || "General").trim();
  const status = form.get("status") === "draft" ? "draft" : "published";
  const visibility = form.get("visibility") === "institution" ? "institution" : "general";
  const institutionId = visibility === "institution" ? String(form.get("institutionId") || "") : null;
  if (!(file instanceof File) || !title) return Response.json({ error: "Selecciona un archivo y escribe un título." }, { status: 400 });
  if (visibility === "institution" && !institutionId) return Response.json({ error: "Selecciona la institución." }, { status: 400 });
  let validated;
  try { validated = await validateClinicalFile(file); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Archivo no válido." }, { status: 400 }); }

  const id = crypto.randomUUID();
  const fileKey = `resources/${id}/${validated.safeName}`;
  await uploadStoredFile(fileKey, validated.bytes, validated.mimeType);
  const now = Date.now();
  try {
    const client = supabaseAdmin();
    const { error } = await client.from("resources").insert({ id, title, description, type, category, status, visibility, institution_id: institutionId, version: 1, file_key: fileKey, file_name: file.name, mime_type: validated.mimeType, file_size: file.size, checksum: validated.checksum, created_by: user.email, created_at: now, updated_at: now });
    throwIfError(error);
    const { error: versionError } = await client.from("resource_versions").insert({ id: crypto.randomUUID(), resource_id: id, version: 1, file_key: fileKey, file_name: file.name, mime_type: validated.mimeType, file_size: file.size, checksum: validated.checksum, created_by: user.email, created_at: now });
    throwIfError(versionError);
    const { error: auditError } = await client.from("audit_log").insert({ id: crypto.randomUUID(), actor_email: user.email, action: "uploaded", entity_type: "resource", entity_id: id, detail: title, created_at: now });
    throwIfError(auditError);
  } catch (error) {
    await removeStoredFile(fileKey).catch(() => undefined);
    throw error;
  }
  return Response.json({ resource: { id, title, fileName: file.name, status, visibility, institutionId } }, { status: 201 });
}

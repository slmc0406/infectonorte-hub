import { getAdminUser } from "@/lib/admin-auth";
import { decryptBackup, type HubBackup } from "@/lib/backup";
import { runtimeEnv } from "@/lib/runtime";
import { downloadStoredFile, supabaseAdmin, throwIfError, uploadStoredFile } from "@/lib/supabase";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });
  const secret = runtimeEnv().BACKUP_ENCRYPTION_SECRET || runtimeEnv().INSTITUTION_SESSION_SECRET;
  if (!secret) return Response.json({ error: "El cifrado de copias no está configurado." }, { status: 503 });
  const { id } = await context.params;
  const client = supabaseAdmin();
  const { data: backupRecord, error } = await client.from("backups").select("object_key").eq("id", id).maybeSingle();
  throwIfError(error);
  if (!backupRecord) return Response.json({ error: "Copia no encontrada." }, { status: 404 });
  try {
    const object = await downloadStoredFile(backupRecord.object_key);
    const manifest = await decryptBackup(await object.arrayBuffer(), secret);
    if (manifest.backupId !== id) throw new Error("La identidad de la copia no coincide.");
    await restoreFiles(manifest);
    if (manifest.institutions.length) { const { error } = await client.from("institutions").upsert(manifest.institutions); throwIfError(error); }
    if (manifest.resources.length) { const { error } = await client.from("resources").upsert(manifest.resources); throwIfError(error); }
    if (manifest.resourceVersions.length) { const { error } = await client.from("resource_versions").upsert(manifest.resourceVersions); throwIfError(error); }
    if (manifest.audit.length) { const { error } = await client.from("audit_log").upsert(manifest.audit, { ignoreDuplicates: true }); throwIfError(error); }
    const now = Date.now();
    const { error: updateError } = await client.from("backups").update({ status: "restored", restored_by: user.email, restored_at: now }).eq("id", id); throwIfError(updateError);
    const { error: auditError } = await client.from("audit_log").insert({ id: crypto.randomUUID(), actor_email: user.email, action: "restored", entity_type: "backup", entity_id: id, detail: `Restauración segura · ${manifest.resources.length} recursos`, created_at: now }); throwIfError(auditError);
    return Response.json({ ok: true, restored: { institutions: manifest.institutions.length, resources: manifest.resources.length, files: manifest.files.length } });
  } catch (reason) {
    return Response.json({ error: reason instanceof Error ? reason.message : "No fue posible restaurar la copia." }, { status: 500 });
  }
}

async function restoreFiles(manifest: HubBackup) {
  const metadata = new Map([...manifest.resourceVersions, ...manifest.resources].map((row) => [row.file_key, row]));
  for (const file of manifest.files) {
    const backupObject = await downloadStoredFile(file.backupKey);
    const meta = metadata.get(file.sourceKey);
    await uploadStoredFile(file.sourceKey, await backupObject.arrayBuffer(), meta?.mime_type || "application/octet-stream", true);
  }
}

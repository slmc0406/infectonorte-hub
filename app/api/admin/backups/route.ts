import { getAdminUser } from "@/lib/admin-auth";
import { encryptBackup, type AuditBackupRow, type BackupFile, type HubBackup, type InstitutionBackupRow, type ResourceBackupRow, type VersionBackupRow } from "@/lib/backup";
import { runtimeEnv } from "@/lib/runtime";
import { downloadStoredFile, supabaseAdmin, throwIfError, uploadStoredFile } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { data, error } = await supabaseAdmin().from("backups").select("*").order("created_at", { ascending: false }).limit(25);
  throwIfError(error);
  return Response.json({ backups: (data || []).map((row) => ({ id: row.id, status: row.status, institutionCount: row.institution_count, resourceCount: row.resource_count, fileCount: row.file_count, createdBy: row.created_by, createdAt: row.created_at, restoredBy: row.restored_by, restoredAt: row.restored_at })) });
}

export async function POST() {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });
  const secret = runtimeEnv().BACKUP_ENCRYPTION_SECRET || runtimeEnv().INSTITUTION_SESSION_SECRET;
  if (!secret) return Response.json({ error: "El cifrado de copias no está configurado." }, { status: 503 });
  const client = supabaseAdmin();
  const [institutionsResult, resourcesResult, versionsResult, auditResult] = await Promise.all([
    client.from("institutions").select("*").order("created_at"),
    client.from("resources").select("*").order("created_at"),
    client.from("resource_versions").select("*").order("created_at"),
    client.from("audit_log").select("*").order("created_at"),
  ]);
  throwIfError(institutionsResult.error); throwIfError(resourcesResult.error); throwIfError(versionsResult.error); throwIfError(auditResult.error);
  const institutions = (institutionsResult.data || []) as InstitutionBackupRow[];
  const resources = (resourcesResult.data || []) as ResourceBackupRow[];
  const resourceVersions = (versionsResult.data || []) as VersionBackupRow[];
  const audit = (auditResult.data || []) as AuditBackupRow[];
  const id = crypto.randomUUID();
  const prefix = `backups/${id}`;
  const files: BackupFile[] = [];
  const sourceKeys = [...new Set([...resources.map((item) => item.file_key), ...resourceVersions.map((item) => item.file_key)])];
  try {
    for (const [index, sourceKey] of sourceKeys.entries()) {
      const source = await downloadStoredFile(sourceKey);
      const backupKey = `${prefix}/files/${String(index + 1).padStart(5, "0")}`;
      await uploadStoredFile(backupKey, await source.arrayBuffer(), "application/octet-stream");
      files.push({ sourceKey, backupKey });
    }
    const now = Date.now();
    const manifest: HubBackup = { format: "infectonorte-hub-backup", formatVersion: 1, backupId: id, createdAt: now, institutions, resources, resourceVersions, audit, files };
    const objectKey = `${prefix}/manifest.ihb`;
    await uploadStoredFile(objectKey, await encryptBackup(manifest, secret), "application/octet-stream");
    const { error } = await client.from("backups").insert({ id, object_key: objectKey, status: "ready", institution_count: institutions.length, resource_count: resources.length, file_count: files.length, created_by: user.email, created_at: now });
    throwIfError(error);
    const { error: auditError } = await client.from("audit_log").insert({ id: crypto.randomUUID(), actor_email: user.email, action: "created", entity_type: "backup", entity_id: id, detail: `Copia cifrada · ${resources.length} recursos · ${files.length} archivos`, created_at: now });
    throwIfError(auditError);
    return Response.json({ ok: true, backup: { id, status: "ready", institutionCount: institutions.length, resourceCount: resources.length, fileCount: files.length, createdBy: user.email, createdAt: now } }, { status: 201 });
  } catch (reason) {
    return Response.json({ error: reason instanceof Error ? reason.message : "No fue posible crear la copia." }, { status: 500 });
  }
}

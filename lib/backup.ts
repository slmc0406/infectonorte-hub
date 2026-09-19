const encoder = new TextEncoder();
const decoder = new TextDecoder();
const MAGIC = encoder.encode("IHUBBKP1");

export type InstitutionBackupRow = { id: string; name: string; city: string; slug: string; status: string; password_salt: string; password_hash: string; created_at: number; updated_at: number };
export type ResourceBackupRow = { id: string; title: string; description: string; type: string; category: string; status: string; visibility: string; institution_id: string | null; version: number; file_key: string; file_name: string; mime_type: string; file_size: number; checksum: string; created_by: string; created_at: number; updated_at: number };
export type VersionBackupRow = { id: string; resource_id: string; version: number; file_key: string; file_name: string; mime_type: string; file_size: number; checksum: string; created_by: string; created_at: number };
export type AuditBackupRow = { id: string; actor_email: string; action: string; entity_type: string; entity_id: string; detail: string; created_at: number };
export type BackupFile = { sourceKey: string; backupKey: string };

export type HubBackup = {
  format: "infectonorte-hub-backup";
  formatVersion: 1;
  backupId: string;
  createdAt: number;
  institutions: InstitutionBackupRow[];
  resources: ResourceBackupRow[];
  resourceVersions: VersionBackupRow[];
  audit: AuditBackupRow[];
  files: BackupFile[];
};

async function backupKey(secret: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`infectonorte-hub-backup:${secret}`));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptBackup(manifest: HubBackup, secret: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await backupKey(secret), encoder.encode(JSON.stringify(manifest))));
  const output = new Uint8Array(MAGIC.length + iv.length + encrypted.length);
  output.set(MAGIC, 0); output.set(iv, MAGIC.length); output.set(encrypted, MAGIC.length + iv.length);
  return output;
}

export async function decryptBackup(value: ArrayBuffer, secret: string): Promise<HubBackup> {
  const bytes = new Uint8Array(value);
  if (bytes.length < MAGIC.length + 13 || !MAGIC.every((byte, index) => bytes[index] === byte)) throw new Error("Formato de copia no válido.");
  const iv = bytes.slice(MAGIC.length, MAGIC.length + 12);
  const encrypted = bytes.slice(MAGIC.length + 12);
  const clear = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, await backupKey(secret), encrypted);
  const parsed = JSON.parse(decoder.decode(clear)) as HubBackup;
  if (parsed.format !== "infectonorte-hub-backup" || parsed.formatVersion !== 1 || !Array.isArray(parsed.resources) || !Array.isArray(parsed.files)) throw new Error("La copia no es compatible.");
  return parsed;
}

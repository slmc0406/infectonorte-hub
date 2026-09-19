import { createClient } from "@supabase/supabase-js";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Falta configurar ${name}.`);
  return value;
}

export function supabaseAdmin() {
  return createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function storageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET?.trim() || "hub-documents";
}

export async function uploadStoredFile(path: string, bytes: ArrayBuffer | Uint8Array, contentType: string, upsert = false) {
  const { error } = await supabaseAdmin().storage.from(storageBucket()).upload(path, bytes, { contentType, upsert });
  throwIfError(error);
}

export async function downloadStoredFile(path: string) {
  const { data, error } = await supabaseAdmin().storage.from(storageBucket()).download(path);
  throwIfError(error);
  if (!data) throw new Error("El archivo solicitado no está disponible.");
  return data;
}

export async function removeStoredFile(path: string) {
  const { error } = await supabaseAdmin().storage.from(storageBucket()).remove([path]);
  throwIfError(error);
}

export function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export function mapInstitution(row: Record<string, unknown>) {
  return { id: row.id, name: row.name, city: row.city, slug: row.slug, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at };
}

export function mapResource(row: Record<string, unknown>) {
  return {
    id: row.id, title: row.title, description: row.description, type: row.type, category: row.category,
    status: row.status, visibility: row.visibility, institutionId: row.institution_id,
    institutionName: row.institution_name, version: row.version, fileKey: row.file_key,
    fileName: row.file_name, mimeType: row.mime_type, fileSize: row.file_size, checksum: row.checksum,
    createdBy: row.created_by, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export function mapVersion(row: Record<string, unknown>) {
  return {
    id: row.id, resourceId: row.resource_id, version: row.version, fileKey: row.file_key,
    fileName: row.file_name, mimeType: row.mime_type, fileSize: row.file_size, checksum: row.checksum,
    createdBy: row.created_by, createdAt: row.created_at,
  };
}

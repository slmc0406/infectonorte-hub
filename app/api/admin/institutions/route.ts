import { getAdminUser } from "@/lib/admin-auth";
import { hashPassword, slugify } from "@/lib/security";
import { supabaseAdmin, throwIfError } from "@/lib/supabase";

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });
  const payload = await request.json().catch(() => ({})) as { name?: string; city?: string; slug?: string; password?: string };
  const name = payload.name?.trim() || "";
  const city = payload.city?.trim() || "Cúcuta";
  const slug = slugify(payload.slug?.trim() || name);
  const password = payload.password || "";
  if (!name || !slug || password.length < 8) {
    return Response.json({ error: "Completa el nombre y una contraseña de mínimo 8 caracteres." }, { status: 400 });
  }
  const id = crypto.randomUUID();
  const now = Date.now();
  const secured = await hashPassword(password);
  try {
    const client = supabaseAdmin();
    const { error } = await client.from("institutions").insert({ id, name, city, slug, status: "active", password_salt: secured.salt, password_hash: secured.hash, created_at: now, updated_at: now });
    throwIfError(error);
    const { error: auditError } = await client.from("audit_log").insert({ id: crypto.randomUUID(), actor_email: user.email, action: "created", entity_type: "institution", entity_id: id, detail: name, created_at: now });
    throwIfError(auditError);
  } catch (error) {
    const message = error instanceof Error && /unique|duplicate/i.test(error.message) ? "Esa URL institucional ya existe." : "No fue posible crear la institución.";
    return Response.json({ error: message }, { status: 409 });
  }
  return Response.json({ institution: { id, name, city, slug, status: "active", resources: 0 } }, { status: 201 });
}

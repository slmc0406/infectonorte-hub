import { getAdminUser } from "@/lib/admin-auth";
import { hashPassword, slugify } from "@/lib/security";
import { supabaseAdmin, throwIfError } from "@/lib/supabase";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await context.params;
  const payload = await request.json().catch(() => ({})) as { name?: string; city?: string; slug?: string; status?: string; password?: string };
  const client = supabaseAdmin();
  const { data: current, error: currentError } = await client.from("institutions").select("name,city,slug,status").eq("id", id).maybeSingle();
  throwIfError(currentError);
  if (!current) return Response.json({ error: "Institución no encontrada." }, { status: 404 });
  const name = payload.name?.trim() || current.name;
  const city = payload.city?.trim() || current.city;
  const slug = slugify(payload.slug?.trim() || current.slug);
  const status = ["active", "draft", "archived"].includes(payload.status || "") ? payload.status! : current.status;
  const password = payload.password || "";
  if (!name || !slug || (password && password.length < 8)) return Response.json({ error: "Revisa el nombre, la URL y la contraseña." }, { status: 400 });
  const now = Date.now();
  try {
    const updates: Record<string, unknown> = { name, city, slug, status, updated_at: now };
    if (password) { const secured = await hashPassword(password); updates.password_salt = secured.salt; updates.password_hash = secured.hash; }
    const { error } = await client.from("institutions").update(updates).eq("id", id); throwIfError(error);
    const { error: auditError } = await client.from("audit_log").insert({ id: crypto.randomUUID(), actor_email: user.email, action: "updated", entity_type: "institution", entity_id: id, detail: `${name}${password ? " · contraseña actualizada" : ""}`, created_at: now });
    throwIfError(auditError);
  } catch (error) {
    const message = error instanceof Error && /unique|duplicate/i.test(error.message) ? "Esa URL institucional ya existe." : "No fue posible actualizar la institución.";
    return Response.json({ error: message }, { status: 409 });
  }
  return Response.json({ ok: true });
}

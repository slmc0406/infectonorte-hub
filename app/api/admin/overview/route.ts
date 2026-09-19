import { getAdminUser } from "@/lib/admin-auth";
import { mapInstitution, mapResource, supabaseAdmin, throwIfError } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });
  const client = supabaseAdmin();
  const [institutionResult, resourceResult, auditResult] = await Promise.all([
    client.from("institutions").select("*").order("created_at", { ascending: false }),
    client.from("resources").select("*,institutions(name)").order("created_at", { ascending: false }),
    client.from("audit_log").select("action,entity_type,detail,created_at").order("created_at", { ascending: false }).limit(10),
  ]);
  throwIfError(institutionResult.error); throwIfError(resourceResult.error); throwIfError(auditResult.error);
  const resourceRows = resourceResult.data || [];
  const institutions = (institutionResult.data || []).map((row) => ({
    ...mapInstitution(row),
    resources: resourceRows.filter((resource) => resource.institution_id === row.id).length,
  }));
  const resources = resourceRows.map((row) => mapResource({ ...row, institution_name: Array.isArray(row.institutions) ? row.institutions[0]?.name : row.institutions?.name }));
  const audit = (auditResult.data || []).map((row) => ({ action: row.action, entityType: row.entity_type, detail: row.detail, createdAt: row.created_at }));
  return Response.json({
    user: { name: user.displayName, email: user.email },
    institutions,
    resources,
    audit,
  });
}

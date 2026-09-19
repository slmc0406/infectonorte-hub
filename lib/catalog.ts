import { mapResource, supabaseAdmin, throwIfError } from "@/lib/supabase";

export type CatalogResource = {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  status: string;
  version: number;
  fileName: string;
  fileSize: number;
  updatedAt: number;
};

export async function getPublicResources(limit?: number) {
  let query = supabaseAdmin().from("resources").select("*")
    .eq("status", "published").eq("visibility", "general").order("updated_at", { ascending: false });
  if (typeof limit === "number") query = query.limit(limit);
  const { data, error } = await query;
  throwIfError(error);
  return (data || []).map((row) => mapResource(row) as unknown as CatalogResource);
}

export async function getPublicResource(id: string) {
  const { data, error } = await supabaseAdmin().from("resources").select("*")
    .eq("id", id).eq("status", "published").eq("visibility", "general").maybeSingle();
  throwIfError(error);
  return data ? mapResource(data) as unknown as CatalogResource & { createdBy: string; createdAt: number } : null;
}

export function formatCatalogDate(value: number) {
  return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(value)).replace(" de ", " ").replace(" de ", " ");
}

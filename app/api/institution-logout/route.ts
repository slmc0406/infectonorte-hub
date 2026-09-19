import { cookies } from "next/headers";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
  const jar = await cookies();
  jar.delete("hub_institution_session");
  const form = await request.formData().catch(() => null);
  const slug = String(form?.get("slug") || "");
  return NextResponse.redirect(new URL(slug ? `/i/${slug}` : "/", request.url), 303);
}

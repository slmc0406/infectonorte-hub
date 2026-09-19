import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/runtime";

export async function GET(request: Request) {
  const jar = await cookies();
  jar.delete("hub_admin_session");
  return NextResponse.redirect(absoluteUrl("/", request), 303);
}

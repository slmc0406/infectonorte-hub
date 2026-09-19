import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const jar = await cookies();
  jar.delete("hub_admin_session");
  return NextResponse.redirect(new URL("/", request.url), 303);
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin-auth";
import { runtimeEnv } from "@/lib/runtime";
import { createAdminSession, privateAccessKey, safeSecretMatch } from "@/lib/security";
import { evaluateAccessLimit, recordFailedAccess, type AccessLimitRecord } from "@/lib/rate-limit";
import { supabaseAdmin, throwIfError } from "@/lib/supabase";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const expected = runtimeEnv().ADMIN_PASSWORD || "";
  const secret = runtimeEnv().ADMIN_SESSION_SECRET || "";
  if (!expected || !secret) return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const limitKey = await privateAccessKey(`admin:${email}`, address, secret);
  const client = supabaseAdmin();
  const { data: limitRow, error: limitError } = await client.from("access_limits").select("*").eq("key", limitKey).maybeSingle();
  throwIfError(limitError);
  const stored = limitRow ? { attempts: limitRow.attempts, windowStartedAt: limitRow.window_started_at, blockedUntil: limitRow.blocked_until } as AccessLimitRecord : null;
  const limit = evaluateAccessLimit(stored);
  if (limit.blocked) return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  if (!isAdminEmail(email) || !(await safeSecretMatch(password, expected))) {
    const failed = recordFailedAccess(stored);
    const { error } = await client.from("access_limits").upsert({ key: limitKey, attempts: failed.attempts, window_started_at: failed.windowStartedAt, blocked_until: failed.blockedUntil, updated_at: Date.now() });
    throwIfError(error);
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  }
  const { error: deleteError } = await client.from("access_limits").delete().eq("key", limitKey);
  throwIfError(deleteError);
  const jar = await cookies();
  jar.set("hub_admin_session", await createAdminSession(email, secret), {
    httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8, path: "/",
  });
  return NextResponse.redirect(new URL("/admin", request.url), 303);
}

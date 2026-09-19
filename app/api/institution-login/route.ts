import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { runtimeEnv } from "@/lib/runtime";
import { supabaseAdmin, throwIfError } from "@/lib/supabase";
import { createInstitutionSession, privateAccessKey, verifyPassword } from "@/lib/security";
import { evaluateAccessLimit, recordFailedAccess, retryAfterSeconds, type AccessLimitRecord } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { slug?: string; password?: string };
  if (!body.slug || !body.password) return NextResponse.json({ ok: false }, { status: 400 });
  const secret = runtimeEnv().INSTITUTION_SESSION_SECRET;
  if (!secret) return NextResponse.json({ error: "Acceso no configurado" }, { status: 503 });
  const address = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "unknown";
  const limitKey = await privateAccessKey(body.slug, address, secret);
  const client = supabaseAdmin();
  const { data: limitRow, error: limitError } = await client.from("access_limits").select("*").eq("key", limitKey).maybeSingle();
  throwIfError(limitError);
  const storedLimit = limitRow ? { attempts: limitRow.attempts, windowStartedAt: limitRow.window_started_at, blockedUntil: limitRow.blocked_until } as AccessLimitRecord : null;
  const limit = evaluateAccessLimit(storedLimit || null);
  if (limit.blocked) {
    return NextResponse.json({ ok: false, error: "Demasiados intentos. Intenta nuevamente más tarde." }, {
      status: 429,
      headers: { "retry-after": String(retryAfterSeconds(limit.blockedUntil)) },
    });
  }
  const { data: institution, error: institutionError } = await client.from("institutions")
    .select("id,password_salt,password_hash").eq("slug", body.slug).eq("status", "active").maybeSingle();
  throwIfError(institutionError);
  const passwordSalt = institution?.password_salt as string | undefined;
  const passwordHash = institution?.password_hash as string | undefined;
  const valid = institution && passwordSalt && passwordHash && await verifyPassword(body.password, passwordSalt, passwordHash);
  if (!valid) {
    const failed = recordFailedAccess(storedLimit || null);
    const { error } = await client.from("access_limits").upsert({ key: limitKey, attempts: failed.attempts, window_started_at: failed.windowStartedAt, blocked_until: failed.blockedUntil, updated_at: Date.now() });
    throwIfError(error);
    const headers = failed.blockedUntil ? { "retry-after": String(retryAfterSeconds(failed.blockedUntil)) } : undefined;
    return NextResponse.json({ ok: false, error: failed.blocked ? "Demasiados intentos. Intenta nuevamente más tarde." : undefined }, { status: failed.blocked ? 429 : 401, headers });
  }
  const { error: deleteError } = await client.from("access_limits").delete().eq("key", limitKey);
  throwIfError(deleteError);
  const value = await createInstitutionSession(institution.id, secret);
  const jar = await cookies();
  jar.set("hub_institution_session", value, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8, path: "/" });
  return NextResponse.json({ ok: true });
}

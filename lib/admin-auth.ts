import { cookies } from "next/headers";
import { runtimeEnv } from "@/lib/runtime";
import { readAdminSession } from "@/lib/security";

const OWNER_EMAIL = "slmc0406@gmail.com";

export function isAdminEmail(email: string) {
  const allowed = (runtimeEnv().ADMIN_EMAILS || runtimeEnv().ADMIN_EMAIL || OWNER_EMAIL).split(",").map((item) => item.trim().toLowerCase());
  return allowed.includes(email.toLowerCase());
}

export async function getAdminUser() {
  const secret = runtimeEnv().ADMIN_SESSION_SECRET || "";
  const jar = await cookies();
  const email = await readAdminSession(jar.get("hub_admin_session")?.value, secret);
  if (!email || !isAdminEmail(email)) return null;
  return { email, displayName: email.split("@")[0], fullName: null };
}

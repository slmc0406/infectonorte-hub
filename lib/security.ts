const encoder = new TextEncoder();

function hex(bytes: ArrayBuffer | Uint8Array) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomHex(length = 16) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return hex(bytes);
}

export async function hashPassword(password: string, salt = randomHex()) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const result = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: encoder.encode(salt), iterations: 210_000 },
    key,
    256,
  );
  return { salt, hash: hex(result) };
}

export async function verifyPassword(password: string, salt: string, expected: string) {
  const { hash } = await hashPassword(password, salt);
  if (hash.length !== expected.length) return false;
  let diff = 0;
  for (let index = 0; index < hash.length; index += 1) diff |= hash.charCodeAt(index) ^ expected.charCodeAt(index);
  return diff === 0;
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

export async function privateAccessKey(slug: string, address: string, secret: string) {
  return hmac(`institution-login:${slug}:${address}`, secret);
}

export async function createInstitutionSession(institutionId: string, secret: string) {
  const expires = Date.now() + 8 * 60 * 60 * 1000;
  const payload = `${institutionId}.${expires}`;
  return `${payload}.${await hmac(payload, secret)}`;
}

export async function createAdminSession(email: string, secret: string) {
  const expires = Date.now() + 8 * 60 * 60 * 1000;
  const payload = `${encodeURIComponent(email)}.${expires}`;
  return `${payload}.${await hmac(payload, secret)}`;
}

export async function readAdminSession(value: string | undefined, secret: string) {
  if (!value || !secret) return null;
  const [encodedEmail, expiresText, signature] = value.split(".");
  const expires = Number(expiresText);
  if (!encodedEmail || !signature || !Number.isFinite(expires) || expires < Date.now()) return null;
  const payload = `${encodedEmail}.${expires}`;
  const expected = await hmac(payload, secret);
  if (expected.length !== signature.length) return null;
  let diff = 0;
  for (let index = 0; index < expected.length; index += 1) diff |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
  return diff === 0 ? decodeURIComponent(encodedEmail) : null;
}

export async function safeSecretMatch(value: string, expected: string) {
  const salt = "infectonorte-hub-admin";
  const [left, right] = await Promise.all([hashPassword(value, salt), hashPassword(expected, salt)]);
  if (left.hash.length !== right.hash.length) return false;
  let diff = 0;
  for (let index = 0; index < left.hash.length; index += 1) diff |= left.hash.charCodeAt(index) ^ right.hash.charCodeAt(index);
  return diff === 0;
}

export async function readInstitutionSession(value: string | undefined, secret: string) {
  if (!value) return null;
  const [institutionId, expiresText, signature] = value.split(".");
  const expires = Number(expiresText);
  if (!institutionId || !signature || !Number.isFinite(expires) || expires < Date.now()) return null;
  const expected = await hmac(`${institutionId}.${expires}`, secret);
  if (expected.length !== signature.length) return null;
  let diff = 0;
  for (let index = 0; index < expected.length; index += 1) diff |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
  return diff === 0 ? institutionId : null;
}

export function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64);
}

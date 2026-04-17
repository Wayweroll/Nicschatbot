import { cookies } from "next/headers";
import { getEnv } from "@/lib/env";
import { getDb, newId, nowIso } from "@/lib/d1";

const COOKIE_NAME = "admin_session";

async function sha256Bytes(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return new Uint8Array(digest);
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function hashToken(token: string) {
  const env = getEnv();
  const digest = await sha256Bytes(`${token}:${env.SESSION_SECRET}`);
  return Array.from(digest)
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
}

export async function createAdminSession(email: string) {
  const env = getEnv();
  const token = `${newId()}${newId()}`;
  const tokenHash = await hashToken(token);
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
  const db = getDb();
  const secureCookie = env.APP_URL ? env.APP_URL.startsWith("https://") : process.env.NODE_ENV === "production";

  await db
    .prepare("INSERT INTO admin_sessions (id, token_hash, email, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(newId(), tokenHash, email, expires, nowIso())
    .run();

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/",
    expires: new Date(expires)
  });
}

export async function clearAdminSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (token) {
    const db = getDb();
    await db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").bind(await hashToken(token)).run();
  }

  cookies().delete(COOKIE_NAME);
}

export async function requireAdminSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  const db = getDb();
  const row = await db
    .prepare("SELECT * FROM admin_sessions WHERE token_hash = ? AND expires_at > ?")
    .bind(await hashToken(token), nowIso())
    .first<any>();

  if (!row) return null;
  return { email: row.email as string };
}

export async function isValidAdminCredentials(email: string, password: string) {
  const env = getEnv();
  const safeCompare = async (a: string, b: string) => timingSafeEqualBytes(await sha256Bytes(a), await sha256Bytes(b));
  const normalizedEmailInput = email.trim().toLowerCase();
  const normalizedEmailEnv = env.ADMIN_EMAIL.trim().toLowerCase();
  const normalizedPasswordInput = password.trim();
  const normalizedPasswordEnv = env.ADMIN_PASSWORD.trim();

  return (await safeCompare(normalizedEmailInput, normalizedEmailEnv)) &&
    (await safeCompare(normalizedPasswordInput, normalizedPasswordEnv));
}

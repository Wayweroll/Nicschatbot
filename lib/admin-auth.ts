import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";
import { getEnv } from "@/lib/env";
import { getDb, newId, nowIso } from "@/lib/d1";

const COOKIE_NAME = "admin_session";

function hashToken(token: string) {
  const env = getEnv();
  return createHash("sha256").update(`${token}:${env.SESSION_SECRET}`).digest("hex");
}

export async function createAdminSession(email: string) {
  const token = `${newId()}${newId()}`;
  const tokenHash = hashToken(token);
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
  const db = getDb();

  await db
    .prepare("INSERT INTO admin_sessions (id, token_hash, email, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(newId(), tokenHash, email, expires, nowIso())
    .run();

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: new Date(expires)
  });
}

export async function clearAdminSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (token) {
    const db = getDb();
    await db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").bind(hashToken(token)).run();
  }

  cookies().delete(COOKIE_NAME);
}

export async function requireAdminSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  const db = getDb();
  const row = await db
    .prepare("SELECT * FROM admin_sessions WHERE token_hash = ? AND expires_at > ?")
    .bind(hashToken(token), nowIso())
    .first<any>();

  if (!row) return null;
  return { email: row.email as string };
}

export function isValidAdminCredentials(email: string, password: string) {
  const env = getEnv();
  const safeCompare = (a: string, b: string) => {
    const ah = createHash("sha256").update(a).digest();
    const bh = createHash("sha256").update(b).digest();
    return timingSafeEqual(ah, bh);
  };

  return safeCompare(email, env.ADMIN_EMAIL) && safeCompare(password, env.ADMIN_PASSWORD);
}

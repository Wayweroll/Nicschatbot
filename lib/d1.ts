import { getRequestContext } from "@cloudflare/next-on-pages";

export function getDb() {
  const ctx = getRequestContext();
  const db = ctx.env.DB as D1Database | undefined;

  if (!db) {
    throw new Error("D1 binding 'DB' is not available. Ensure Cloudflare binding is configured.");
  }

  return db;
}

export function nowIso() {
  return new Date().toISOString();
}

export function toBool(value: number | boolean | null | undefined) {
  return value === 1 || value === true;
}

export function newId() {
  return crypto.randomUUID().replace(/-/g, "");
}

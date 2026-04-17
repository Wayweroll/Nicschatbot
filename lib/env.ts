import { z } from "zod";

const envSchema = z.object({
  SESSION_SECRET: z.string().min(20),
  APP_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8)
});

export type AppEnv = z.infer<typeof envSchema>;
export type AdminEnv = Pick<AppEnv, "SESSION_SECRET" | "APP_URL" | "ADMIN_EMAIL" | "ADMIN_PASSWORD">;

let cachedEnv: AppEnv | null = null;
let cachedAdminEnv: AdminEnv | null = null;

function normalize(value: string | undefined) {
  return value?.trim();
}

/**
 * Backwards compatibility:
 * - NEXTAUTH_SECRET/NEXTAUTH_URL are still accepted for existing deployments.
 *
 * Note: this is lazily evaluated so build-time module loading does not fail
 * before runtime environment variables are provided by the platform.
 */
export function getEnv(): AppEnv {
  if (cachedEnv) return cachedEnv;

  cachedEnv = envSchema.parse({
    SESSION_SECRET: normalize(process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET),
    APP_URL: normalize(process.env.APP_URL ?? process.env.NEXTAUTH_URL),
    OPENAI_API_KEY: normalize(process.env.OPENAI_API_KEY),
    OPENAI_MODEL: normalize(process.env.OPENAI_MODEL),
    ADMIN_EMAIL: normalize(process.env.ADMIN_EMAIL)?.toLowerCase(),
    ADMIN_PASSWORD: normalize(process.env.ADMIN_PASSWORD)
  });

  return cachedEnv;
}

const adminEnvSchema = z.object({
  SESSION_SECRET: z.string().min(20),
  APP_URL: z.string().url().optional(),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8)
});

export function getAdminEnv(): AdminEnv {
  if (cachedAdminEnv) return cachedAdminEnv;

  cachedAdminEnv = adminEnvSchema.parse({
    SESSION_SECRET: normalize(process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET),
    APP_URL: normalize(process.env.APP_URL ?? process.env.NEXTAUTH_URL),
    ADMIN_EMAIL: normalize(process.env.ADMIN_EMAIL)?.toLowerCase(),
    ADMIN_PASSWORD: normalize(process.env.ADMIN_PASSWORD)
  });

  return cachedAdminEnv;
}

import { z } from "zod";

const envSchema = z.object({
  SESSION_SECRET: z.string().min(20),
  APP_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8)
});

/**
 * Backwards compatibility:
 * - NEXTAUTH_SECRET/NEXTAUTH_URL are still accepted for existing deployments.
 */
export const env = envSchema.parse({
  SESSION_SECRET: process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET,
  APP_URL: process.env.APP_URL ?? process.env.NEXTAUTH_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
});

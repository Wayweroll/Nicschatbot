import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

function setBaseEnv() {
  process.env.SESSION_SECRET = "12345678901234567890";
  process.env.OPENAI_API_KEY = "test-openai-key";
  process.env.ADMIN_EMAIL = "admin@example.com";
  process.env.ADMIN_PASSWORD = "password123";
}

describe("getEnv", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.NEXTAUTH_SECRET;
    delete process.env.NEXTAUTH_URL;
    delete process.env.APP_URL;
    setBaseEnv();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("trims and normalizes env values", async () => {
    process.env.ADMIN_EMAIL = "  ADMIN@EXAMPLE.COM  ";
    process.env.ADMIN_PASSWORD = "  password123  ";
    process.env.OPENAI_API_KEY = "  test-openai-key  ";

    const { getEnv } = await import("@/lib/env");
    const env = getEnv();

    expect(env.ADMIN_EMAIL).toBe("admin@example.com");
    expect(env.ADMIN_PASSWORD).toBe("password123");
    expect(env.OPENAI_API_KEY).toBe("test-openai-key");
  });

  it("accepts trimmed APP_URL", async () => {
    process.env.APP_URL = "  https://example.com  ";

    const { getEnv } = await import("@/lib/env");
    const env = getEnv();

    expect(env.APP_URL).toBe("https://example.com");
  });
});

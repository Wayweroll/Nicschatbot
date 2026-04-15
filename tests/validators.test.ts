import { describe, expect, it } from "vitest";
import { chatRequestSchema, subjectCreateSchema } from "@/lib/validators";

describe("subjectCreateSchema", () => {
  it("accepts valid subject payload", () => {
    const result = subjectCreateSchema.safeParse({
      code: "COMP101",
      name: "Intro",
      description: "desc"
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid subject payload", () => {
    const result = subjectCreateSchema.safeParse({
      code: "",
      name: "A"
    });

    expect(result.success).toBe(false);
  });
});

describe("chatRequestSchema", () => {
  it("requires message and valid-ish ids", () => {
    const result = chatRequestSchema.safeParse({
      subjectId: "x",
      message: ""
    });

    expect(result.success).toBe(false);
  });
});

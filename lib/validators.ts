import { z } from "zod";

export const subjectCreateSchema = z.object({
  code: z.string().trim().min(2).max(12),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional()
});

export const subjectUpdateSchema = subjectCreateSchema.extend({
  isArchived: z.boolean().optional()
});

export const chatRequestSchema = z.object({
  subjectId: z.string().trim().min(8).max(64),
  message: z.string().trim().min(1).max(3000),
  sessionId: z.string().trim().min(8).max(64).optional()
});

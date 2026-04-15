import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function ensureVectorStore(name: string, existingId?: string | null) {
  if (existingId) return existingId;

  const vectorStore = await openai.vectorStores.create({ name });
  return vectorStore.id;
}

export async function uploadSubjectFile(params: {
  vectorStoreId: string;
  fileName: string;
  buffer: Buffer;
  mimeType: string;
}) {
  const uploadable = await toFile(params.buffer, params.fileName, { type: params.mimeType });
  const file = await openai.files.create({
    file: uploadable,
    purpose: "assistants"
  });

  const vectorStoreFile = await openai.vectorStores.files.create(params.vectorStoreId, {
    file_id: file.id
  });

  return { openaiFileId: file.id, vectorStoreFileId: vectorStoreFile.id };
}

export async function waitForVectorStoreFileIndexing(vectorStoreId: string, vectorStoreFileId: string) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const status = await openai.vectorStores.files.retrieve(vectorStoreId, vectorStoreFileId);
    if (status.status === "completed") return "READY" as const;
    if (status.status === "failed" || status.status === "cancelled") {
      logger.error("Vector store indexing failed", { status });
      return "FAILED" as const;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return "FAILED" as const;
}

const SYSTEM_RULES = `You are a university course knowledge chatbot.
- Only answer from the provided file_search content for the active subject.
- If the answer is missing or unclear, explicitly say you cannot find it in the selected subject materials.
- Do not fabricate due dates, rubric criteria, submission methods, policy details, grades, extension outcomes, integrity rulings, or special consideration advice.
- Keep responses concise and student-friendly.
- Use Australian spelling.
- Mention source document names when possible.`;

export async function createSubjectScopedResponse(params: {
  vectorStoreId: string;
  userMessage: string;
}) {
  return openai.responses.create({
    model: env.OPENAI_MODEL,
    input: [
      { role: "system", content: SYSTEM_RULES },
      { role: "user", content: params.userMessage }
    ],
    tools: [
      {
        type: "file_search",
        vector_store_ids: [params.vectorStoreId]
      }
    ]
  });
}

export function extractOutputText(response: OpenAI.Responses.Response) {
  return response.output_text?.trim() || "I could not find a reliable answer in the selected subject materials.";
}

export function extractSources(response: OpenAI.Responses.Response) {
  const sources = new Set<string>();
  for (const item of response.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content) {
      if (content.type !== "output_text" || !content.annotations) continue;
      for (const annotation of content.annotations) {
        if (annotation.type === "file_citation") {
          sources.add(annotation.filename || annotation.file_id);
        }
      }
    }
  }
  return Array.from(sources);
}

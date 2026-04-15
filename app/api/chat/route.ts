import { NextRequest, NextResponse } from "next/server";
import { chatRequestSchema } from "@/lib/validators";
import {
  addChatMessage,
  createChatSession,
  getChatSession,
  getSubjectById,
  listSubjectFiles
} from "@/lib/db";
import { createSubjectScopedResponse, extractOutputText, extractSources } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = chatRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const subject = await getSubjectById(parsed.data.subjectId);
  const readyFiles = await listSubjectFiles(parsed.data.subjectId);

  if (!subject || subject.isArchived) {
    return NextResponse.json({ error: "Selected subject is unavailable." }, { status: 404 });
  }

  if (!subject.vectorStoreId || readyFiles.filter((f) => f.isActive && f.status === "READY").length === 0) {
    return NextResponse.json(
      { error: "No indexed files are available for this subject yet." },
      { status: 400 }
    );
  }

  const session = parsed.data.sessionId
    ? await getChatSession(parsed.data.sessionId)
    : await createChatSession(subject.id);

  if (!session || session.subjectId !== subject.id) {
    return NextResponse.json({ error: "Session/subject mismatch." }, { status: 400 });
  }

  await addChatMessage({ sessionId: session.id, role: "USER", content: parsed.data.message });

  const modelResponse = await createSubjectScopedResponse({
    vectorStoreId: subject.vectorStoreId,
    userMessage: parsed.data.message
  });

  const answer = extractOutputText(modelResponse);
  const sources = extractSources(modelResponse);

  await addChatMessage({
    sessionId: session.id,
    role: "ASSISTANT",
    content: answer,
    sourceSummary: sources.join(", ")
  });

  return NextResponse.json({ sessionId: session.id, answer, sources });
}

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";
import { getSubjectById } from "@/lib/db";
import { createSubjectScopedResponse, extractOutputText, extractSources } from "@/lib/openai";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (admin.error) return admin.error;

  const body = await req.json();
  const message = String(body.message ?? "").trim();
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const subject = await getSubjectById(params.id);
  if (!subject?.vectorStoreId) {
    return NextResponse.json({ error: "Subject has no vector store" }, { status: 400 });
  }

  const response = await createSubjectScopedResponse({
    vectorStoreId: subject.vectorStoreId,
    userMessage: message
  });

  return NextResponse.json({ answer: extractOutputText(response), sources: extractSources(response) });
}

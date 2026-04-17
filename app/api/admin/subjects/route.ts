export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";
import { subjectCreateSchema } from "@/lib/validators";
import { ensureVectorStore } from "@/lib/openai";
import { createSubject, listSubjects } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-log";

export async function GET() {
  const admin = await requireAdmin();
  if (admin.error) return admin.error;

  const subjects = await listSubjects();
  return NextResponse.json({ subjects });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (admin.error) return admin.error;

  const json = await req.json();
  const parsed = subjectCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const vectorStoreId = await ensureVectorStore(`${parsed.data.code} ${parsed.data.name}`);
  const subject = await createSubject({ ...parsed.data, vectorStoreId });

  await logAdminAction({
    adminId: admin.admin.email,
    action: "CREATE_SUBJECT",
    subjectId: subject?.id,
    metadata: { code: parsed.data.code }
  });

  return NextResponse.json({ subject }, { status: 201 });
}

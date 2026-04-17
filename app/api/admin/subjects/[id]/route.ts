export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";
import { subjectUpdateSchema } from "@/lib/validators";
import { deleteSubject, getSubjectById, listSubjectFiles, updateSubject } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-log";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (admin.error) return admin.error;

  const subject = await getSubjectById(params.id);
  if (!subject) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const files = await listSubjectFiles(params.id);
  return NextResponse.json({ subject: { ...subject, files } });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (admin.error) return admin.error;

  const json = await req.json();
  const parsed = subjectUpdateSchema.partial().safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const subject = await updateSubject(params.id, parsed.data);
  if (!subject) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logAdminAction({
    adminId: admin.admin.email,
    action: subject.isArchived ? "ARCHIVE_SUBJECT" : "UPDATE_SUBJECT",
    subjectId: subject.id,
    metadata: parsed.data
  });

  return NextResponse.json({ subject });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (admin.error) return admin.error;

  await deleteSubject(params.id);
  await logAdminAction({
    adminId: admin.admin.email,
    action: "DELETE_SUBJECT",
    subjectId: params.id
  });

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";
import { updateSubjectFile } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-log";

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  const admin = await requireAdmin();
  if (admin.error) return admin.error;

  await updateSubjectFile(params.fileId, { isActive: false, status: "ARCHIVED" });

  await logAdminAction({
    adminId: admin.admin.email,
    action: "REMOVE_FILE",
    subjectId: params.id,
    metadata: { fileId: params.fileId }
  });

  return NextResponse.json({ success: true });
}

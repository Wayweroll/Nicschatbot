import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";
import { listSubjectFiles, logAdminAction } from "@/lib/db";

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (admin.error) return admin.error;

  await logAdminAction({ adminId: admin.admin.email, action: "REINDEX_SUBJECT", subjectId: params.id });
  const files = await listSubjectFiles(params.id);

  return NextResponse.json({
    message: `Refresh acknowledged for ${files.filter((f) => f.isActive).length} active file(s).`
  });
}

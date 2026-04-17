export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";
import { createSubjectFile, getSubjectById, listSubjectFiles, updateSubjectFile } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-log";
import { uploadSubjectFile, waitForVectorStoreFileIndexing } from "@/lib/openai";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (admin.error) return admin.error;

  const files = await listSubjectFiles(params.id);
  return NextResponse.json({ files });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (admin.error) return admin.error;

  const subject = await getSubjectById(params.id);
  if (!subject?.vectorStoreId) {
    return NextResponse.json({ error: "Subject vector store missing" }, { status: 400 });
  }

  const form = await req.formData();
  const uploaded = form.get("file");
  const notes = form.get("notes")?.toString();

  if (!(uploaded instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const buffer = Buffer.from(await uploaded.arrayBuffer());
  const draftId = await createSubjectFile({
    subjectId: params.id,
    displayName: uploaded.name,
    uploadedBy: admin.admin.email,
    notes
  });

  try {
    const { openaiFileId, vectorStoreFileId } = await uploadSubjectFile({
      vectorStoreId: subject.vectorStoreId,
      fileName: uploaded.name,
      buffer,
      mimeType: uploaded.type || "application/octet-stream"
    });

    await updateSubjectFile(draftId, { status: "INDEXING", openaiFileId });
    const finalStatus = await waitForVectorStoreFileIndexing(subject.vectorStoreId, vectorStoreFileId);
    await updateSubjectFile(draftId, { status: finalStatus });

    await logAdminAction({
      adminId: admin.admin.email,
      action: "UPLOAD_FILE",
      subjectId: params.id,
      metadata: { fileId: draftId, filename: uploaded.name }
    });

    return NextResponse.json({ fileId: draftId, status: finalStatus }, { status: 201 });
  } catch {
    await updateSubjectFile(draftId, { status: "FAILED" });
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

import { notFound, redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { getSubjectById, listSubjectFiles } from "@/lib/db";
import { AdminSubjectDetail } from "@/components/admin-subject-detail";

export default async function SubjectDetailPage({ params }: { params: { id: string } }) {
  const admin = await requireAdminSession();
  if (!admin) redirect("/admin/login");

  const subject = await getSubjectById(params.id);
  if (!subject) return notFound();

  const files = await listSubjectFiles(params.id);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <AdminSubjectDetail subject={{ ...subject, files }} />
    </main>
  );
}

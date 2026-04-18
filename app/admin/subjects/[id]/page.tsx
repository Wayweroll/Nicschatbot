export const runtime = "edge";
import Link from "next/link";
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
      <div className="mb-4 flex gap-2">
        <Link className="rounded-xl border border-white/20 px-3 py-1 text-sm hover:bg-white/10" href="/">
          Home
        </Link>
        <Link className="rounded-xl border border-white/20 px-3 py-1 text-sm hover:bg-white/10" href="/admin">
          Back to admin
        </Link>
      </div>
      <AdminSubjectDetail subject={{ ...subject, files }} />
    </main>
  );
}

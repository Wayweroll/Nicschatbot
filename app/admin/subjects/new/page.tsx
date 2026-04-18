export const runtime = "edge";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { AdminSubjectForm } from "@/components/admin-subject-form";

export default async function NewSubjectPage() {
  const admin = await requireAdminSession();
  if (!admin) redirect("/admin/login");

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="mb-4">
        <div className="mb-3 flex gap-2">
          <Link className="rounded-xl border border-white/20 px-3 py-1 text-sm hover:bg-white/10" href="/">
            Home
          </Link>
          <Link className="rounded-xl border border-white/20 px-3 py-1 text-sm hover:bg-white/10" href="/admin">
            Back to admin
          </Link>
        </div>
        <h1 className="text-2xl font-bold">New subject</h1>
        <p className="mt-1 text-sm text-slate-400">Create a subject and initialise its retrieval store.</p>
      </div>
      <AdminSubjectForm />
    </main>
  );
}

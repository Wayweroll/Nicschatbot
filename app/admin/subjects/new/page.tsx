import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { AdminSubjectForm } from "@/components/admin-subject-form";

export default async function NewSubjectPage() {
  const admin = await requireAdminSession();
  if (!admin) redirect("/admin/login");

  return (
    <main className="mx-auto max-w-2xl p-6">
      <AdminSubjectForm />
    </main>
  );
}

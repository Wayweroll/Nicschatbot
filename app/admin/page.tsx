import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { listSubjects } from "@/lib/db";

export default async function AdminDashboardPage() {
  const admin = await requireAdminSession();
  if (!admin) redirect("/admin/login");

  const subjects = await listSubjects();

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin dashboard</h1>
          <p className="text-sm text-slate-600">Signed in as {admin.email}</p>
        </div>
        <form action="/api/admin/logout" method="post">
          <button className="rounded border px-3 py-2 text-sm">Sign out</button>
        </form>
      </header>

      <div className="flex justify-end">
        <Link className="rounded bg-slate-900 px-4 py-2 text-white" href="/admin/subjects/new">
          New subject
        </Link>
      </div>

      <section className="rounded border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Subjects</h2>
        <ul className="space-y-2 text-sm">
          {subjects.map((subject) => (
            <li key={subject.id} className="rounded border p-2">
              <Link className="font-medium text-blue-700" href={`/admin/subjects/${subject.id}`}>
                {subject.code} — {subject.name}
              </Link>
              <p className="text-slate-500">{subject.isArchived ? "Archived" : "Active"}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

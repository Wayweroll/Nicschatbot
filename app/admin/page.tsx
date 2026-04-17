import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { listSubjects } from "@/lib/db";

export default async function AdminDashboardPage() {
  const admin = await requireAdminSession();
  if (!admin) redirect("/admin/login");

  const subjects = await listSubjects();

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="surface mb-6 flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Admin dashboard</p>
          <h1 className="text-2xl font-bold">Course chatbot control panel</h1>
          <p className="mt-1 text-sm text-slate-400">Signed in as {admin.email}</p>
        </div>
        <div className="flex gap-2">
          <Link className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500" href="/admin/subjects/new">
            New subject
          </Link>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10">Sign out</button>
          </form>
        </div>
      </header>

      <section className="surface p-5">
        <h2 className="mb-3 text-lg font-semibold">Subjects</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {subjects.map((subject) => (
            <li key={subject.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <Link className="font-medium text-blue-300 hover:underline" href={`/admin/subjects/${subject.id}`}>
                {subject.code} — {subject.name}
              </Link>
              <p className="mt-1 text-xs text-slate-400">{subject.isArchived ? "Archived" : "Active"}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

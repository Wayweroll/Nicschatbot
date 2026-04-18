import Link from "next/link";
import { StudentHomeClient } from "@/components/student-home-client";

export default function StudentHomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 pb-10 pt-6 md:px-8 md:pt-10">
      <header className="surface-subtle flex flex-col gap-6 rounded-3xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <p className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-slate-200">
            Course Knowledge Assistant
          </p>
          <Link
            href="/admin/login"
            className="text-xs text-slate-400 underline-offset-4 transition hover:text-slate-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
          >
            Admin
          </Link>
        </div>

        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">Ask questions about your subject</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300 md:text-base">
            Get answers based only on the course documents for the subject you choose. If the answer is not in the
            files, the assistant will tell you.
          </p>
        </div>
      </header>

      <StudentHomeClient />
    </main>
  );
}

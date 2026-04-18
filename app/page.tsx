export const runtime = "edge";
export const dynamic = "force-dynamic";

import { StudentChat } from "@/components/student-chat";
import { listActiveSubjectsWithReadyFileCounts } from "@/lib/db";
import { logger } from "@/lib/logger";
import Link from "next/link";

export default async function StudentHomePage() {
  let subjects: Awaited<ReturnType<typeof listActiveSubjectsWithReadyFileCounts>> = [];
  let dataUnavailable = false;

  try {
    subjects = await listActiveSubjectsWithReadyFileCounts();
  } catch (error) {
    dataUnavailable = true;
    logger.error("Failed to load active subjects for homepage.", error);
  }

  const totalReady = subjects.reduce((sum, subject) => sum + subject.readyCount, 0);

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <section className="surface mb-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Course Knowledge Assistant
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Ask questions about your subject materials</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300 md:text-base">
              This assistant only answers from uploaded course documents for the subject you select. If content is missing or unclear, it will say so.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
              <div className="text-slate-400">Active subjects</div>
              <div className="text-xl font-semibold">{subjects.length}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
              <div className="text-slate-400">Ready files</div>
              <div className="text-xl font-semibold">{totalReady}</div>
            </div>
          </div>
        </div>
        <div className="mt-5 border-t border-white/10 pt-4 text-xs text-slate-400">
          Admin access: <Link className="text-blue-300 underline" href="/admin/login">/admin/login</Link>
        </div>
      </section>

      <StudentChat
        subjects={subjects.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          files: Array.from({ length: s.readyCount }, (_, i) => ({ id: `${s.id}-${i}` }))
        }))}
      />

      {dataUnavailable ? (
        <section className="surface mt-6 border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">Temporary data connection issue</p>
          <p className="mt-1">
            We could not load subjects right now. Please refresh shortly. Admins should verify the Cloudflare D1
            binding
            <code className="mx-1 rounded bg-black/30 px-1 py-0.5">DB</code>
            in the active environment.
          </p>
        </section>
      ) : null}
    </main>
  );
}

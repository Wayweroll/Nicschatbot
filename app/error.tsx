"use client";

import Link from "next/link";

export default function GlobalPageError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-6">
      <section className="surface w-full border border-amber-400/40 bg-amber-500/10 p-6 text-amber-100">
        <h1 className="text-xl font-semibold">Something went wrong loading this page</h1>
        <p className="mt-2 text-sm text-amber-100/90">
          Please refresh and try again. If this keeps happening, the admin should check runtime configuration.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-amber-300"
          >
            Try again
          </button>
          <Link
            href="/admin/login"
            className="rounded-xl border border-amber-200/40 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-500/20"
          >
            Admin login
          </Link>
        </div>
      </section>
    </main>
  );
}

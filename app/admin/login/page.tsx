"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Sign in failed");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center p-4">
      <section className="surface w-full p-6 md:p-7">
        <p className="mb-2 text-xs uppercase tracking-wide text-blue-300">Staff portal</p>
        <h1 className="text-2xl font-bold">Admin login</h1>
        <p className="mt-1 text-sm text-slate-400">Manage subjects, files, and chatbot behaviour.</p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Email" className="input" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Password" className="input" />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <button disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-50">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}

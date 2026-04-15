"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      setError("Invalid credentials");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Admin login</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded border bg-white p-4">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Email" className="w-full rounded border p-2" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Password" className="w-full rounded border p-2" />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="w-full rounded bg-slate-900 px-4 py-2 text-white">Sign in</button>
      </form>
    </main>
  );
}

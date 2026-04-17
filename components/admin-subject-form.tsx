"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminSubjectForm() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, name, description })
    });

    const data = (await res.json()) as { subject?: { id: string } };
    if (!res.ok) {
      setError("Could not create subject.");
      setLoading(false);
      return;
    }

    if (!data.subject?.id) {
      setError("Could not create subject.");
      setLoading(false);
      return;
    }

    router.push(`/admin/subjects/${data.subject.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded border bg-white p-4">
      <h2 className="text-lg font-semibold">Create subject</h2>
      <input placeholder="Code" className="w-full rounded border p-2" value={code} onChange={(e) => setCode(e.target.value)} />
      <input placeholder="Name" className="w-full rounded border p-2" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea placeholder="Description" className="w-full rounded border p-2" value={description} onChange={(e) => setDescription(e.target.value)} />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button className="rounded bg-slate-900 px-4 py-2 text-white" disabled={loading}>{loading ? "Creating…" : "Create"}</button>
    </form>
  );
}

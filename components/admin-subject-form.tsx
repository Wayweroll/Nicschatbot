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
    if (!res.ok || !data.subject?.id) {
      setError("Could not create subject.");
      setLoading(false);
      return;
    }

    router.push(`/admin/subjects/${data.subject.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="surface space-y-4 p-6">
      <h2 className="text-lg font-semibold">Create subject</h2>
      <input placeholder="Code (e.g. COMP101)" className="input" value={code} onChange={(e) => setCode(e.target.value)} />
      <input placeholder="Subject name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea placeholder="Description" className="input min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-50" disabled={loading}>
        {loading ? "Creating…" : "Create subject"}
      </button>
    </form>
  );
}

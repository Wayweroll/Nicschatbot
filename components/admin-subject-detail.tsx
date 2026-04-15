"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SubjectFile = {
  id: string;
  displayName: string;
  status: string;
  isActive: boolean;
  uploadedAt: string;
};

type Subject = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isArchived: boolean;
  files: SubjectFile[];
};

export function AdminSubjectDetail({ subject }: { subject: Subject }) {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const router = useRouter();

  async function uploadFile(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    const form = new FormData();
    form.set("file", file);
    form.set("notes", notes);

    await fetch(`/api/admin/subjects/${subject.id}/files`, { method: "POST", body: form });
    setFile(null);
    setNotes("");
    router.refresh();
  }

  async function removeFile(fileId: string) {
    await fetch(`/api/admin/subjects/${subject.id}/files/${fileId}`, { method: "DELETE" });
    router.refresh();
  }

  async function testChat(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/admin/subjects/${subject.id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    const payload = await res.json();
    setAnswer(payload.answer || payload.error || "No response");
    setSources(payload.sources || []);
  }

  return (
    <div className="space-y-6">
      <section className="rounded border bg-white p-4">
        <h2 className="text-lg font-semibold">{subject.code} — {subject.name}</h2>
        <p className="mt-1 text-sm text-slate-600">{subject.description}</p>
      </section>

      <section className="rounded border bg-white p-4">
        <h3 className="font-semibold">Upload file</h3>
        <form onSubmit={uploadFile} className="mt-3 space-y-2">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Upload notes" className="w-full rounded border p-2" />
          <button className="rounded bg-slate-900 px-4 py-2 text-white">Upload and index</button>
        </form>
      </section>

      <section className="rounded border bg-white p-4">
        <h3 className="font-semibold">Current files</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {subject.files.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between rounded border p-2">
              <span>{entry.displayName} ({entry.status}) {entry.isActive ? "" : "[inactive]"}</span>
              {entry.isActive ? <button className="text-red-700" onClick={() => removeFile(entry.id)}>Remove</button> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded border bg-white p-4">
        <h3 className="font-semibold">Test subject chatbot</h3>
        <form onSubmit={testChat} className="space-y-2 mt-2">
          <textarea className="w-full rounded border p-2" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
          <button className="rounded bg-blue-700 px-4 py-2 text-white">Test query</button>
        </form>
        {answer ? (
          <div className="mt-3 rounded border bg-slate-50 p-3 text-sm">
            <p>{answer}</p>
            {sources.length ? <p className="mt-1 text-xs text-slate-500">Sources: {sources.join(", ")}</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

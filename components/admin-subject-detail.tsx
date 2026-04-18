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
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function uploadFile(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setBusy(true);
    const form = new FormData();
    form.set("file", file);
    form.set("notes", notes);

    await fetch(`/api/admin/subjects/${subject.id}/files`, { method: "POST", body: form });
    setFile(null);
    setNotes("");
    setBusy(false);
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
    const payload = (await res.json()) as { answer?: string; error?: string; sources?: string[] };
    setAnswer(payload.answer || payload.error || "No response");
    setSources(payload.sources || []);
  }

  return (
    <div className="space-y-5">
      <section className="surface p-5">
        <h2 className="text-xl font-semibold">{subject.code} — {subject.name}</h2>
        <p className="mt-2 text-sm text-slate-400">{subject.description || "No description provided."}</p>
      </section>

      <section className="surface p-5">
        <h3 className="font-semibold">Upload file</h3>
        <form onSubmit={uploadFile} className="mt-3 space-y-3">
          <input className="input file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Upload notes" className="input" />
          <button disabled={busy} className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-50">{busy ? "Uploading…" : "Upload and index"}</button>
        </form>
      </section>

      <section className="surface p-5">
        <h3 className="font-semibold">Current files</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {subject.files.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <span>{entry.displayName} ({entry.status}) {entry.isActive ? "" : "[inactive]"}</span>
              {entry.isActive ? <button className="text-red-300 hover:text-red-200" onClick={() => removeFile(entry.id)}>Remove</button> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="surface p-5">
        <h3 className="font-semibold">Test subject chatbot</h3>
        <form onSubmit={testChat} className="mt-3 space-y-2">
          <textarea className="input min-h-24" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
          <button className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500">Test query</button>
        </form>
        {answer ? (
          <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/40 p-3 text-sm">
            <p>{answer}</p>
            {sources.length ? <p className="mt-1 text-xs text-slate-400">Sources: {sources.join(", ")}</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

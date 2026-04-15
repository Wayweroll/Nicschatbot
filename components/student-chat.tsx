"use client";

import { useState } from "react";

type Subject = {
  id: string;
  code: string;
  name: string;
  files: { id: string }[];
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
};

export function StudentChat({ subjects }: { subjects: Subject[] }) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const active = subjects.find((s) => s.id === subjectId);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !subjectId) return;

    const userMessage = message.trim();
    setMessage("");
    setError(null);
    setHistory((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId,
        message: userMessage,
        sessionId
      })
    });

    const payload = await res.json();
    if (!res.ok) {
      setError(payload.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    if (payload.sessionId) setSessionId(payload.sessionId);
    setHistory((prev) => [
      ...prev,
      { role: "assistant", content: payload.answer, sources: payload.sources }
    ]);
    setLoading(false);
  }

  return (
    <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-600">
        Answers are generated only from uploaded course materials for the selected subject.
      </p>
      <label className="block text-sm font-medium">
        Select subject
        <select
          className="mt-1 w-full rounded border p-2"
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setSessionId(undefined);
            setHistory([]);
          }}
        >
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.code} — {subject.name}
            </option>
          ))}
        </select>
      </label>

      <div className="rounded border bg-slate-50 p-3 text-sm">
        Active subject: <strong>{active ? `${active.code} — ${active.name}` : "None"}</strong>
      </div>

      {active && active.files.length === 0 ? (
        <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          This subject has no ready files yet. Please try again later.
        </div>
      ) : null}

      <div className="max-h-96 space-y-3 overflow-auto rounded border p-3">
        {history.length === 0 ? <p className="text-sm text-slate-500">No messages yet.</p> : null}
        {history.map((entry, idx) => (
          <div key={idx} className={entry.role === "user" ? "text-right" : "text-left"}>
            <div
              className={`inline-block max-w-[90%] rounded px-3 py-2 text-sm ${
                entry.role === "user" ? "bg-blue-600 text-white" : "bg-white border"
              }`}
            >
              {entry.content}
            </div>
            {entry.sources?.length ? (
              <div className="mt-1 text-xs text-slate-500">Sources: {entry.sources.join(", ")}</div>
            ) : null}
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a question about this subject"
          className="w-full rounded border p-2"
          rows={3}
        />
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading || !subjectId}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}

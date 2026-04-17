"use client";

import { useMemo, useState } from "react";

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

  const active = useMemo(() => subjects.find((s) => s.id === subjectId), [subjectId, subjects]);

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
      body: JSON.stringify({ subjectId, message: userMessage, sessionId })
    });

    const payload = (await res.json()) as {
      error?: string;
      sessionId?: string;
      answer?: string;
      sources?: string[];
    };

    if (!res.ok) {
      setError(payload.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    if (payload.sessionId) setSessionId(payload.sessionId);
    setHistory((prev) => [
      ...prev,
      {
        role: "assistant",
        content: payload.answer ?? "I could not find a reliable answer in the selected subject materials.",
        sources: payload.sources ?? []
      }
    ]);

    setLoading(false);
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[300px,1fr]">
      <aside className="surface h-fit space-y-4 p-5">
        <div>
          <h2 className="text-lg font-semibold">Start a chat</h2>
          <p className="mt-1 text-xs text-slate-400">
            Answers use uploaded course documents for the selected subject only.
          </p>
        </div>

        <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
          Subject
          <select
            className="input mt-2"
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

        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm">
          <div className="text-xs uppercase tracking-wide text-slate-400">Active subject</div>
          <p className="mt-1 font-medium">{active ? `${active.code} — ${active.name}` : "None selected"}</p>
          <p className="mt-1 text-xs text-slate-400">Ready files: {active?.files.length ?? 0}</p>
        </div>

        {active && active.files.length === 0 ? (
          <div className="rounded-xl border border-amber-300/40 bg-amber-500/10 p-3 text-xs text-amber-100">
            This subject has no ready files yet. Please try again later.
          </div>
        ) : null}
      </aside>

      <div className="surface flex min-h-[560px] flex-col p-4 md:p-5">
        <div className="flex-1 space-y-3 overflow-auto rounded-xl border border-white/10 bg-slate-950/40 p-4">
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">
              Ask a question like “When is Assignment 1 due?” or “What topics are covered in Week 3?”.
            </p>
          ) : null}

          {history.map((entry, idx) => (
            <div key={idx} className={entry.role === "user" ? "text-right" : "text-left"}>
              <div
                className={`inline-block max-w-[92%] rounded-2xl px-4 py-2 text-sm ${
                  entry.role === "user"
                    ? "bg-blue-600 text-white"
                    : "border border-white/10 bg-slate-900 text-slate-100"
                }`}
              >
                {entry.content}
              </div>
              {entry.sources?.length ? (
                <div className="mt-1 text-xs text-slate-400">Sources: {entry.sources.join(", ")}</div>
              ) : null}
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question about this subject"
            className="input min-h-24"
            rows={3}
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Use concise questions for best results.</p>
            <button
              type="submit"
              disabled={loading || !subjectId}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

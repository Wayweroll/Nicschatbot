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

const SUGGESTED_PROMPTS = [
  "When is Assignment 1 due?",
  "What topics are covered in Session 3?",
  "What are the assessment requirements?"
];

export function StudentChat({ subjects }: { subjects: Subject[] }) {
  const [subjectId, setSubjectId] = useState("");
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const active = useMemo(() => subjects.find((s) => s.id === subjectId), [subjectId, subjects]);
  const hasSelection = Boolean(active);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !hasSelection) return;

    const userMessage = message.trim();
    setMessage("");
    setError(null);
    setHistory((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
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
    } finally {
      setLoading(false);
    }
  }

  function useSuggestedPrompt(prompt: string) {
    setMessage(prompt);
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[320px,1fr]">
      <aside className="surface space-y-4 p-5">
        <div>
          <h2 className="text-base font-semibold text-white">Choose subject</h2>
          <p className="mt-1 text-sm text-slate-400">Select a subject to begin.</p>
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
              setError(null);
            }}
          >
            <option value="">Choose subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.code} — {subject.name}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm">
          <div className="text-xs uppercase tracking-wide text-slate-400">Current subject</div>
          <p className="mt-1 font-medium text-slate-100">{active ? `${active.code} — ${active.name}` : "Choose subject"}</p>
          <p className="mt-1 text-xs text-slate-400">Documents loaded: {active?.files.length ?? 0}</p>
        </div>
      </aside>

      <div className="surface flex min-h-[540px] flex-col p-4 md:p-5">
        <div className="flex-1 space-y-3 overflow-auto rounded-xl border border-white/10 bg-slate-950/40 p-4">
          {history.length === 0 ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Welcome</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Choose a subject and ask about assessments, class content, due dates, or course requirements.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => useSuggestedPrompt(prompt)}
                    disabled={!hasSelection}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
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
            disabled={!hasSelection}
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-slate-400">Ask one question at a time for clearer answers.</p>
            <button
              type="submit"
              disabled={loading || !hasSelection || !message.trim()}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

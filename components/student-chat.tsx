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

  const currentSubject = useMemo(() => subjects.find((subject) => subject.id === subjectId), [subjectId, subjects]);
  const subjectSelected = Boolean(currentSubject);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !subjectSelected) return;

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

      if (payload.sessionId) {
        setSessionId(payload.sessionId);
      }

      setHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: payload.answer ?? "I could not find that in the selected subject documents.",
          sources: payload.sources ?? []
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function selectPrompt(prompt: string) {
    if (!subjectSelected) return;
    setMessage(prompt);
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[320px,1fr]">
      <aside className="surface-subtle h-fit rounded-3xl p-5 md:p-6">
        <h2 className="text-base font-semibold text-white">Choose subject</h2>
        <p className="mt-1 text-sm text-slate-400">Select a subject to begin.</p>

        <label htmlFor="subject-select" className="mt-5 block text-xs font-medium uppercase tracking-wide text-slate-400">
          Subject
        </label>
        <select
          id="subject-select"
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setSessionId(undefined);
            setHistory([]);
            setError(null);
            setMessage("");
          }}
          className="input mt-2"
        >
          <option value="">Select a subject</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.code} — {subject.name}
            </option>
          ))}
        </select>

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Current subject</p>
          {currentSubject ? (
            <>
              <p className="mt-2 text-sm font-medium text-slate-100">
                {currentSubject.code} — {currentSubject.name}
              </p>
              <p className="mt-1 text-xs text-slate-400">{currentSubject.files.length} document(s) loaded</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-400">No subject selected yet.</p>
          )}
        </div>
      </aside>

      <div className="surface-subtle flex min-h-[460px] flex-col rounded-3xl p-4 md:p-6">
        <div className="flex-1 rounded-2xl border border-white/10 bg-slate-950/45 p-4 md:p-5">
          {history.length === 0 ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-semibold text-white">Welcome</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Choose a subject and ask about assessments, class content, due dates, or course requirements.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => selectPrompt(prompt)}
                    disabled={!subjectSelected}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry, idx) => (
                <article key={idx} className={entry.role === "user" ? "text-right" : "text-left"}>
                  <div
                    className={`inline-block max-w-[92%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                      entry.role === "user"
                        ? "bg-blue-600 text-white"
                        : "border border-white/10 bg-slate-900/90 text-slate-100"
                    }`}
                  >
                    {entry.content}
                  </div>
                  {entry.sources?.length ? (
                    <p className="mt-1 text-xs text-slate-400">Sources: {entry.sources.join(", ")}</p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-2">
          <label htmlFor="question-input" className="sr-only">
            Ask question
          </label>
          <textarea
            id="question-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question about this subject"
            disabled={!subjectSelected || loading}
            className="input min-h-24"
            rows={3}
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-slate-400">Ask one question at a time for clearer answers.</p>
            <button
              type="submit"
              disabled={loading || !subjectSelected || !message.trim()}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { StudentChat } from "@/components/student-chat";

type HomeSubject = {
  id: string;
  code: string;
  name: string;
  readyCount: number;
};

const MOCK_SUBJECTS: HomeSubject[] = [
  {
    id: "dxp221",
    code: "DXP221",
    name: "Post Production Processes",
    readyCount: 1
  },
  {
    id: "pho101",
    code: "PHO101",
    name: "Image Making Foundations",
    readyCount: 1
  }
];

export function StudentHomeClient() {
  const [subjects, setSubjects] = useState<HomeSubject[]>(MOCK_SUBJECTS);
  const [dataUnavailable, setDataUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSubjects() {
      try {
        const res = await fetch("/api/subjects");
        if (!res.ok) throw new Error("Failed to load subjects");

        const payload = (await res.json()) as { subjects?: HomeSubject[] };
        if (cancelled) return;

        if (payload.subjects && payload.subjects.length > 0) {
          setSubjects(payload.subjects);
        } else {
          setSubjects(MOCK_SUBJECTS);
        }
        setDataUnavailable(false);
      } catch {
        if (!cancelled) {
          setSubjects(MOCK_SUBJECTS);
          setDataUnavailable(true);
        }
      }
    }

    void loadSubjects();
    return () => {
      cancelled = true;
    };
  }, []);

  const subjectCount = subjects.length;
  const totalReady = useMemo(() => subjects.reduce((sum, subject) => sum + subject.readyCount, 0), [subjects]);

  return (
    <section className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <article className="surface-subtle rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Subjects available</p>
          <p className="mt-1 text-2xl font-semibold text-white">{subjectCount}</p>
        </article>
        <article className="surface-subtle rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Documents loaded</p>
          <p className="mt-1 text-2xl font-semibold text-white">{totalReady}</p>
        </article>
      </div>

      <StudentChat
        subjects={subjects.map((subject) => ({
          id: subject.id,
          code: subject.code,
          name: subject.name,
          files: Array.from({ length: subject.readyCount }, (_, idx) => ({ id: `${subject.id}-${idx}` }))
        }))}
      />

      {dataUnavailable ? (
        <p className="rounded-xl border border-amber-200/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Live subject data is temporarily unavailable, so example subjects are shown.
        </p>
      ) : null}
    </section>
  );
}

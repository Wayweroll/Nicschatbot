"use client";

import { useEffect, useState } from "react";
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

    async function load() {
      try {
        const res = await fetch("/api/subjects", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load subjects");
        const payload = (await res.json()) as { subjects?: HomeSubject[] };

        if (!cancelled) {
          const next = payload.subjects?.length ? payload.subjects : MOCK_SUBJECTS;
          setSubjects(next);
          setDataUnavailable(false);
        }
      } catch {
        if (!cancelled) {
          setSubjects(MOCK_SUBJECTS);
          setDataUnavailable(true);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="grid gap-4">
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

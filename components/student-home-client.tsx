"use client";

import { useEffect, useMemo, useState } from "react";
import { StudentChat } from "@/components/student-chat";

type HomeSubject = {
  id: string;
  code: string;
  name: string;
  readyCount: number;
};

export function StudentHomeClient() {
  const [subjects, setSubjects] = useState<HomeSubject[]>([]);
  const [dataUnavailable, setDataUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/subjects");
        if (!res.ok) throw new Error("Failed to load subjects");
        const payload = (await res.json()) as { subjects?: HomeSubject[] };
        if (!cancelled) {
          setSubjects(payload.subjects ?? []);
          setDataUnavailable(false);
        }
      } catch {
        if (!cancelled) {
          setSubjects([]);
          setDataUnavailable(true);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalReady = useMemo(
    () => subjects.reduce((sum, subject) => sum + subject.readyCount, 0),
    [subjects]
  );

  useEffect(() => {
    const activeCountEl = document.getElementById("active-subject-count");
    const readyCountEl = document.getElementById("ready-file-count");
    if (activeCountEl) activeCountEl.textContent = String(subjects.length);
    if (readyCountEl) readyCountEl.textContent = String(totalReady);
  }, [subjects.length, totalReady]);

  return (
    <>
      <StudentChat
        subjects={subjects.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          files: Array.from({ length: s.readyCount }, (_, i) => ({ id: `${s.id}-${i}` }))
        }))}
      />

      {dataUnavailable ? (
        <section className="surface mt-6 border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">Temporary data connection issue</p>
          <p className="mt-1">
            We could not load subjects right now. Please refresh shortly. Admins should verify the Cloudflare D1
            binding
            <code className="mx-1 rounded bg-black/30 px-1 py-0.5">DB</code>
            in the active environment.
          </p>
        </section>
      ) : null}
    </>
  );
}

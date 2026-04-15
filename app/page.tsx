import { StudentChat } from "@/components/student-chat";
import { listActiveSubjectsWithReadyFileCounts } from "@/lib/db";

export default async function StudentHomePage() {
  const subjects = await listActiveSubjectsWithReadyFileCounts();

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-2 text-2xl font-bold">Course knowledge chatbot</h1>
      <p className="mb-6 text-sm text-slate-600">
        This chatbot is for course documents only and may not cover information not uploaded by staff.
      </p>
      <StudentChat
        subjects={subjects.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          files: Array.from({ length: s.readyCount }, (_, i) => ({ id: `${s.id}-${i}` }))
        }))}
      />
    </main>
  );
}

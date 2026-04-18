export const runtime = "edge";
import { NextResponse } from "next/server";
import { listActiveSubjectsWithReadyFileCounts } from "@/lib/db";

export async function GET() {
  const subjects = await listActiveSubjectsWithReadyFileCounts();
  return NextResponse.json({
    subjects: subjects.map((subject) => ({
      id: subject.id,
      code: subject.code,
      name: subject.name,
      readyCount: subject.readyCount
    }))
  });
}

import { logAdminAction as writeAdminLog } from "@/lib/db";

export async function logAdminAction(params: {
  adminId: string;
  action: string;
  subjectId?: string;
  metadata?: unknown;
}) {
  await writeAdminLog(params);
}

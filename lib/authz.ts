import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";

export async function requireAdmin() {
  const admin = await requireAdminSession();
  if (!admin) {
    return { error: NextResponse.json({ error: "Unauthorised" }, { status: 401 }) };
  }

  return { admin };
}

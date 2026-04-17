export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { createAdminSession, isValidAdminCredentials } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!(await isValidAdminCredentials(email, password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await createAdminSession(email);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server configuration error. Check admin env variables." }, { status: 500 });
  }
}

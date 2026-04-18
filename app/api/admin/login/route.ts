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
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("D1 binding 'DB' is not available")) {
        return NextResponse.json({ error: "Database binding missing. Configure DB binding in Cloudflare Pages." }, { status: 500 });
      }

      if (error.message.includes("no such table: admin_sessions")) {
        return NextResponse.json({ error: "Database schema missing. Run D1 migrations for admin_sessions." }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Server configuration error. Check admin env variables." }, { status: 500 });
  }
}

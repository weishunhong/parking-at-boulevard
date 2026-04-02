import { NextResponse } from "next/server";
import { getDashboardPassword } from "@/lib/env";
import { setDashboardCookie } from "@/lib/session";

export async function POST(request: Request) {
  const password = getDashboardPassword();
  if (!password) {
    return NextResponse.json(
      { error: "DASHBOARD_PASSWORD not configured" },
      { status: 500 },
    );
  }
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (body.password !== password) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  await setDashboardCookie();
  return NextResponse.json({ ok: true });
}

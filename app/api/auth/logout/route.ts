import { NextResponse } from "next/server";
import { clearDashboardCookie } from "@/lib/session";

export async function POST() {
  await clearDashboardCookie();
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { verifyDashboardCookie } from "@/lib/session";
import { runManualRegistration } from "@/lib/schedule";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await verifyDashboardCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runManualRegistration();
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

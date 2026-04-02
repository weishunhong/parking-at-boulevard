import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getDashboardPassword, getSessionSecret } from "./env";

const COOKIE_NAME = "parking_dashboard";

function signToken(password: string): string {
  const secret = getSessionSecret();
  return createHmac("sha256", secret).update(`dashboard:${password}`).digest("hex");
}

export async function verifyDashboardCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const password = getDashboardPassword();
  if (!token || !password) return false;
  try {
    const expected = signToken(password);
    const a = Buffer.from(token, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function setDashboardCookie(): Promise<void> {
  const password = getDashboardPassword();
  if (!password) throw new Error("Missing DASHBOARD_PASSWORD");
  const token = signToken(password);
  const maxAge = 60 * 60 * 24 * 7;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
    path: "/",
  });
}

export async function clearDashboardCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

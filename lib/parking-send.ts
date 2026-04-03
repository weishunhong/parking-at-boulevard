import type { ParkingFormEnv } from "./parking-env";

/**
 * PropertyBoss sends confirmation email via a separate POST after permit creation:
 * `POST /v1/send?viewpoint=...&container=...&to=...` (see browser Network tab).
 * Set `PARKING_SEND_CONTAINER` from that request; `to` uses `PARKING_EMAIL`.
 */
export function buildParkingSendUrl(
  form: ParkingFormEnv,
  at: Date = new Date(),
): string | null {
  if (process.env.PARKING_SKIP_SEND === "true") return null;
  const container = process.env.PARKING_SEND_CONTAINER?.trim();
  const email = form.email?.trim();
  if (!container || !email) return null;

  const path = (process.env.PARKING_SEND_PATH?.trim() || "v1/send").replace(
    /^\/+/,
    "",
  );
  const u = new URL(`${form.apiBaseUrl}/${path}`);
  u.searchParams.set("viewpoint", at.toISOString());
  u.searchParams.set("container", container);
  u.searchParams.set("to", email);
  return u.toString();
}

export async function postParkingSend(
  url: string,
  form: ParkingFormEnv,
): Promise<{ ok: boolean; status: number; bodyText: string }> {
  const cookie = form.cookie ?? "";
  const bearer = process.env.PARKING_BEARER_TOKEN?.trim();

  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "parking-at-boulevard/1.0",
    ...(cookie ? { Cookie: cookie } : {}),
    ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
  };

  const res = await fetch(url, {
    method: "POST",
    redirect: "follow",
    headers,
  });

  const bodyText = await res.text();
  return { ok: res.ok, status: res.status, bodyText };
}

import type { ParkingFormEnv } from "./parking-env";

/** Placeholders for PARKING_POST_BODY_JSON: {{SMART_DECAL}}, {{VEHICLE}}, {{VIEWPOINT}}, … */
export function parkingPostPlaceholders(
  form: ParkingFormEnv,
  at: Date = new Date(),
): Record<string, string> {
  return {
    SMART_DECAL: form.smartDecalNumber ?? "",
    VEHICLE: form.vehiclePlate ?? "",
    PASSCODE: form.passcode ?? "",
    HOME: form.home ?? "",
    LOCATION: form.locationId ?? "",
    LIFETIME: form.lifetimeIso,
    POLICY: form.policyId,
    MEDIA_QUERY: form.mediaQueryId,
    TENANT: form.tenantSlug,
    EMAIL: form.email ?? "",
    CONTACT_NAME: form.contactName ?? "",
    VIEWPOINT: at.toISOString(),
  };
}

export function substitutePlaceholders(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return vars[key] ?? "";
  });
}

/**
 * When `PARKING_POST_URL` is copied from the browser, the query string often
 * still contains `duration=PT1H` (or similar). We override `duration` from env
 * and set `viewpoint` to the **request instant** (same as when the cron/manual
 * run executes) so PT5H starts from that moment.
 */
export function resolveParkingPostUrl(
  form: ParkingFormEnv,
  at: Date = new Date(),
): string | null {
  const full = process.env.PARKING_POST_URL?.trim();
  if (full) {
    try {
      const u = new URL(full);
      if (u.searchParams.has("duration")) {
        u.searchParams.set("duration", form.lifetimeIso);
      }
      if (u.searchParams.has("viewpoint")) {
        u.searchParams.set("viewpoint", at.toISOString());
      }
      return u.toString();
    } catch {
      return full;
    }
  }
  const rel = process.env.PARKING_POST_RELATIVE_PATH?.trim();
  if (!rel) return null;
  const path = rel.replace(/^\/+/, "");
  return `${form.apiBaseUrl}/${form.tenantSlug}/${path}`;
}

function stripEmpty(
  o: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...o };
  for (const k of Object.keys(out)) {
    if (out[k] === undefined || out[k] === "") {
      delete out[k];
    }
  }
  return out;
}

/** Default JSON body (names aligned with page forms + query). Adjust via PARKING_POST_BODY_JSON. */
export function buildDefaultPostPayload(
  form: ParkingFormEnv,
): Record<string, unknown> {
  return stripEmpty({
    policy: form.policyId,
    mediaQuery: form.mediaQueryId,
    smartDecal: form.smartDecalNumber,
    media: form.smartDecalNumber,
    vehicle: form.vehiclePlate,
    passcode: form.passcode,
    location: form.locationId,
    lifetime: form.lifetimeIso,
    home: form.home,
    email: form.email,
    contactName: form.contactName,
  });
}

export function buildPostJsonBody(
  form: ParkingFormEnv,
  at: Date = new Date(),
): string {
  const raw = process.env.PARKING_POST_BODY_JSON?.trim();
  const vars = parkingPostPlaceholders(form, at);
  if (raw) {
    const filled = substitutePlaceholders(raw, vars);
    try {
      JSON.parse(filled);
    } catch {
      throw new Error(
        "PARKING_POST_BODY_JSON is not valid JSON after placeholder substitution",
      );
    }
    return filled;
  }
  return JSON.stringify(buildDefaultPostPayload(form));
}

export async function postParkingRegistration(
  form: ParkingFormEnv,
  at: Date = new Date(),
): Promise<{ ok: boolean; status: number; bodyText: string }> {
  const url = resolveParkingPostUrl(form, at);
  if (!url) {
    throw new Error("missing_post_url");
  }
  const body = buildPostJsonBody(form, at);
  const cookie = form.cookie ?? "";
  const bearer = process.env.PARKING_BEARER_TOKEN?.trim();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "parking-at-boulevard/1.0",
    ...(cookie ? { Cookie: cookie } : {}),
    ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
  };

  const res = await fetch(url, {
    method: "POST",
    redirect: "follow",
    headers,
    body,
  });

  const bodyText = await res.text();
  return { ok: res.ok, status: res.status, bodyText };
}

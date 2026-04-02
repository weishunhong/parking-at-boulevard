import type { ParkingFormEnv } from "./parking-env";

/** Placeholders for PARKING_POST_BODY_JSON: {{SMART_DECAL}}, {{VEHICLE}}, … */
export function parkingPostPlaceholders(
  form: ParkingFormEnv,
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

export function resolveParkingPostUrl(form: ParkingFormEnv): string | null {
  const full = process.env.PARKING_POST_URL?.trim();
  if (full) return full;
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

export function buildPostJsonBody(form: ParkingFormEnv): string {
  const raw = process.env.PARKING_POST_BODY_JSON?.trim();
  const vars = parkingPostPlaceholders(form);
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
): Promise<{ ok: boolean; status: number; bodyText: string }> {
  const url = resolveParkingPostUrl(form);
  if (!url) {
    throw new Error("missing_post_url");
  }
  const body = buildPostJsonBody(form);
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

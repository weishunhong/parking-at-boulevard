/**
 * HTML shell uses `link rel="api alternate" href="https://api.propertyboss.io/"`.
 * HAR-backed POSTs usually target this host.
 */
export const PARKING_API_BASE_DEFAULT = "https://api.propertyboss.io";

export function getParkingApiBaseUrl(): string {
  return (
    process.env.PARKING_API_BASE_URL ?? PARKING_API_BASE_DEFAULT
  ).replace(/\/$/, "");
}

/** ISO-8601 duration for `lifetime` selects (e.g. Unlock / Preauthorize). */
export function getParkingLifetimeIso(): string {
  const raw = process.env.PARKING_LIFETIME_ISO?.trim();
  if (raw) return raw;
  const n = Number(process.env.REGISTRATION_DURATION_HOURS);
  const hours = Number.isFinite(n) ? n : 5;
  const h = Math.max(1, Math.round(hours));
  return `PT${h}H`;
}

function nonempty(s: string | undefined): string | undefined {
  const t = s?.trim();
  return t ? t : undefined;
}

export type ParkingFormEnv = {
  baseUrl: string;
  tenantSlug: string;
  policyId: string;
  mediaQueryId: string;
  apiBaseUrl: string;
  /** Form input `name="media"` — Smart Decal digits (Activate Smart Decal). */
  smartDecalNumber: string | undefined;
  /** Form input `name="vehicle"` — license plate. */
  vehiclePlate: string | undefined;
  /** Passcode for resident / account auth fieldsets. */
  passcode: string | undefined;
  /** Hidden `name="location"` when the API requires it (copy from Network tab if present). */
  locationId: string | undefined;
  /** Visiting / tenant / “home” line (unit, address, etc.) — fieldset `tenant` / `visiting`. */
  home: string | undefined;
  email: string | undefined;
  contactName: string | undefined;
  cookie: string | undefined;
  lifetimeIso: string;
};

export function getParkingFormEnv(): ParkingFormEnv {
  return {
    baseUrl: (
      process.env.PARKING_BASE_URL ?? "https://boulevard.parkingattendant.com"
    ).replace(/\/$/, ""),
    tenantSlug: process.env.PARKING_TENANT_SLUG?.trim() ?? "",
    policyId: process.env.PARKING_POLICY_ID?.trim() ?? "",
    mediaQueryId: process.env.PARKING_MEDIA_ID?.trim() ?? "",
    apiBaseUrl: getParkingApiBaseUrl(),
    smartDecalNumber: nonempty(process.env.PARKING_SMART_DECAL_NUMBER),
    vehiclePlate: nonempty(process.env.PARKING_VEHICLE_PLATE),
    passcode: nonempty(process.env.PARKING_PASSCODE),
    locationId: nonempty(process.env.PARKING_LOCATION_ID),
    home: nonempty(process.env.PARKING_HOME),
    email: nonempty(process.env.PARKING_EMAIL),
    contactName: nonempty(process.env.PARKING_CONTACT_NAME),
    cookie: nonempty(process.env.PARKING_COOKIE),
    lifetimeIso: getParkingLifetimeIso(),
  };
}

export function missingRequiredPermitUrlEnv(): string[] {
  const e = getParkingFormEnv();
  const miss: string[] = [];
  if (!e.tenantSlug) miss.push("PARKING_TENANT_SLUG");
  if (!e.policyId) miss.push("PARKING_POLICY_ID");
  if (!e.mediaQueryId) miss.push("PARKING_MEDIA_ID");
  return miss;
}

/** Fields needed for the permit / unlock flow; fill from the live form + HAR. */
export function missingRecommendedParkingFormEnv(): string[] {
  const e = getParkingFormEnv();
  const miss: string[] = [];
  if (!e.smartDecalNumber) miss.push("PARKING_SMART_DECAL_NUMBER");
  if (!e.vehiclePlate) miss.push("PARKING_VEHICLE_PLATE");
  if (!e.passcode) miss.push("PARKING_PASSCODE");
  if (!e.home) miss.push("PARKING_HOME");
  return miss;
}

export function parkingEnvSummaryForLogs(e: ParkingFormEnv): Record<string, boolean> {
  return {
    PARKING_SMART_DECAL_NUMBER: Boolean(e.smartDecalNumber),
    PARKING_VEHICLE_PLATE: Boolean(e.vehiclePlate),
    PARKING_PASSCODE: Boolean(e.passcode),
    PARKING_HOME: Boolean(e.home),
    PARKING_LOCATION_ID: Boolean(e.locationId),
    PARKING_EMAIL: Boolean(e.email),
    PARKING_CONTACT_NAME: Boolean(e.contactName),
    PARKING_COOKIE: Boolean(e.cookie),
    PARKING_SEND_CONTAINER: Boolean(process.env.PARKING_SEND_CONTAINER?.trim()),
  };
}

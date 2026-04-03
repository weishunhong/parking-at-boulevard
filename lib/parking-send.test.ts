import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { buildParkingSendUrl } from "./parking-send";
import type { ParkingFormEnv } from "./parking-env";

const baseForm = (): ParkingFormEnv => ({
  baseUrl: "https://boulevard.parkingattendant.com",
  tenantSlug: "t",
  policyId: "p",
  mediaQueryId: "m",
  apiBaseUrl: "https://api.propertyboss.io",
  smartDecalNumber: "1",
  vehiclePlate: "ABC",
  passcode: "5226",
  locationId: "loc",
  home: "home",
  email: "user@example.com",
  contactName: undefined,
  cookie: undefined,
  lifetimeIso: "PT5H",
});

describe("buildParkingSendUrl", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-02T18:43:24.279Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.PARKING_SEND_CONTAINER;
    delete process.env.PARKING_SKIP_SEND;
    delete process.env.PARKING_SEND_PATH;
  });

  it("returns null when container unset", () => {
    expect(buildParkingSendUrl(baseForm())).toBeNull();
  });

  it("returns null when email unset", () => {
    process.env.PARKING_SEND_CONTAINER = "abc123";
    const f = { ...baseForm(), email: undefined };
    expect(buildParkingSendUrl(f)).toBeNull();
  });

  it("builds send URL with viewpoint, container, to", () => {
    process.env.PARKING_SEND_CONTAINER = "0q77rk8q813pf3rmjgpg9gp9a8";
    const u = buildParkingSendUrl(baseForm());
    expect(u).toBeTruthy();
    const parsed = new URL(u!);
    expect(parsed.pathname).toBe("/v1/send");
    expect(parsed.searchParams.get("viewpoint")).toBe("2026-04-02T18:43:24.279Z");
    expect(parsed.searchParams.get("container")).toBe(
      "0q77rk8q813pf3rmjgpg9gp9a8",
    );
    expect(parsed.searchParams.get("to")).toBe("user@example.com");
  });

  it("returns null when PARKING_SKIP_SEND=true", () => {
    process.env.PARKING_SEND_CONTAINER = "x";
    process.env.PARKING_SKIP_SEND = "true";
    expect(buildParkingSendUrl(baseForm())).toBeNull();
  });
});

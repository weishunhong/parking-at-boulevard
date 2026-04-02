import { describe, expect, it, vi, afterEach } from "vitest";
import { resolveParkingPostUrl, substitutePlaceholders } from "./parking-post";
import type { ParkingFormEnv } from "./parking-env";

const minimalForm = (lifetimeIso: string): ParkingFormEnv => ({
  baseUrl: "https://boulevard.parkingattendant.com",
  tenantSlug: "t",
  policyId: "p",
  mediaQueryId: "m",
  apiBaseUrl: "https://api.propertyboss.io",
  smartDecalNumber: "1",
  vehiclePlate: "ABC",
  passcode: "x",
  locationId: "loc",
  home: "h",
  email: "a@b.c",
  contactName: undefined,
  cookie: undefined,
  lifetimeIso,
});

describe("substitutePlaceholders", () => {
  it("replaces known keys", () => {
    expect(
      substitutePlaceholders('{"v":"{{VEHICLE}}","p":"{{PASSCODE}}"}', {
        VEHICLE: "ABC123",
        PASSCODE: "secret",
      }),
    ).toBe('{"v":"ABC123","p":"secret"}');
  });
});

describe("resolveParkingPostUrl", () => {
  const prevUrl = process.env.PARKING_POST_URL;
  const prevRel = process.env.PARKING_POST_RELATIVE_PATH;

  afterEach(() => {
    if (prevUrl === undefined) delete process.env.PARKING_POST_URL;
    else process.env.PARKING_POST_URL = prevUrl;
    if (prevRel === undefined) delete process.env.PARKING_POST_RELATIVE_PATH;
    else process.env.PARKING_POST_RELATIVE_PATH = prevRel;
    vi.useRealTimers();
  });

  it("overrides duration and viewpoint on full PARKING_POST_URL", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-02T19:00:00.000Z"));
    process.env.PARKING_POST_URL =
      "https://api.propertyboss.io/v1/permits/temporary?viewpoint=OLD&duration=PT1H&vehicle=X";
    delete process.env.PARKING_POST_RELATIVE_PATH;

    const u = resolveParkingPostUrl(minimalForm("PT5H"));
    expect(u).toBeTruthy();
    const parsed = new URL(u!);
    expect(parsed.searchParams.get("duration")).toBe("PT5H");
    expect(parsed.searchParams.get("viewpoint")).toBe("2026-04-02T19:00:00.000Z");
    expect(parsed.searchParams.get("vehicle")).toBe("X");
  });

  it("leaves URL unchanged when parse fails", () => {
    process.env.PARKING_POST_URL = "not-a-url";
    expect(resolveParkingPostUrl(minimalForm("PT5H"))).toBe("not-a-url");
  });
});

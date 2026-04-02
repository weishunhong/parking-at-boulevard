import { describe, expect, it, afterEach } from "vitest";
import { getParkingLifetimeIso } from "./parking-env";

describe("getParkingLifetimeIso", () => {
  const prevLife = process.env.PARKING_LIFETIME_ISO;
  const prevDur = process.env.REGISTRATION_DURATION_HOURS;

  afterEach(() => {
    process.env.PARKING_LIFETIME_ISO = prevLife;
    process.env.REGISTRATION_DURATION_HOURS = prevDur;
  });

  it("uses PARKING_LIFETIME_ISO when set", () => {
    process.env.PARKING_LIFETIME_ISO = "PT24H";
    delete process.env.REGISTRATION_DURATION_HOURS;
    expect(getParkingLifetimeIso()).toBe("PT24H");
  });

  it("derives PT{n}H from REGISTRATION_DURATION_HOURS when lifetime unset", () => {
    delete process.env.PARKING_LIFETIME_ISO;
    process.env.REGISTRATION_DURATION_HOURS = "5";
    expect(getParkingLifetimeIso()).toBe("PT5H");
  });
});

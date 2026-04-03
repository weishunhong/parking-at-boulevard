import { describe, expect, it } from "vitest";
import {
  formatLaDateString,
  getLaClock,
  getLaMidnightViewpointIso,
  getLaMonthRangeUtc,
  getLaStartOfDayUtc,
} from "./la";

describe("formatLaDateString", () => {
  it("maps UTC instant to LA calendar date", () => {
    const utc = new Date("2026-04-02T08:00:00.000Z");
    expect(formatLaDateString(utc)).toBe("2026-04-02");
  });
});

describe("getLaMonthRangeUtc", () => {
  it("returns [start, endExclusive) for the LA month containing now", () => {
    const now = new Date("2026-04-15T12:00:00.000Z");
    const { start, endExclusive } = getLaMonthRangeUtc(now);
    expect(endExclusive.getTime()).toBeGreaterThan(start.getTime());
    expect(start.getUTCHours()).toBeDefined();
  });

  it("rolls December to January next year", () => {
    const dec = new Date("2026-12-15T20:00:00.000Z");
    const { start, endExclusive } = getLaMonthRangeUtc(dec);
    expect(formatLaDateString(start)).toBe("2026-12-01");
    expect(endExclusive.getTime()).toBeGreaterThan(start.getTime());
  });
});

describe("getLaStartOfDayUtc / getLaMidnightViewpointIso", () => {
  it("uses LA midnight for the calendar day containing the instant", () => {
    const now = new Date("2026-04-02T19:00:00.000Z");
    expect(getLaMidnightViewpointIso(now)).toBe("2026-04-02T07:00:00.000Z");
    expect(getLaStartOfDayUtc(now).toISOString()).toBe(
      "2026-04-02T07:00:00.000Z",
    );
  });
});

describe("getLaClock", () => {
  it("returns wall-clock parts in LA", () => {
    const utc = new Date("2026-04-02T09:30:00.000Z");
    const c = getLaClock(utc);
    expect(c.hour).toBe(2);
    expect(c.minute).toBe(30);
  });
});

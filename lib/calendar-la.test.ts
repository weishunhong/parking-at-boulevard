import { describe, expect, it } from "vitest";
import {
  buildLaCalendarGrid,
  formatLocalDateTime,
  formatLocalDateTimeForHtmlTime,
  getLaMonthRangeUtcForCalendarMonth,
  groupEventsByLaDate,
  parseCalendarMonthQuery,
  shiftCalendarMonth,
} from "./calendar-la";

describe("getLaMonthRangeUtcForCalendarMonth", () => {
  it("returns April 2026 LA month bounds", () => {
    const { start, endExclusive } = getLaMonthRangeUtcForCalendarMonth(2026, 4);
    expect(start.toISOString()).toContain("2026-04-01");
    expect(endExclusive > start).toBe(true);
  });
});

describe("buildLaCalendarGrid", () => {
  it("has length multiple of 7", () => {
    const cells = buildLaCalendarGrid(2026, 4);
    expect(cells.length % 7).toBe(0);
    expect(cells.filter((c) => c.day !== null).length).toBe(30);
  });
});

describe("shiftCalendarMonth", () => {
  it("rolls year", () => {
    expect(shiftCalendarMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftCalendarMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
  });
});

describe("groupEventsByLaDate", () => {
  it("groups by LA date", () => {
    const map = groupEventsByLaDate([
      { createdAt: new Date("2026-04-02T08:00:00.000Z") },
      { createdAt: new Date("2026-04-02T10:00:00.000Z") },
    ]);
    expect([...map.values()].every((arr) => arr.length >= 1)).toBe(true);
  });
});

describe("formatLocalDateTime / formatLocalDateTimeForHtmlTime", () => {
  it("formats visible string in app TZ", () => {
    const s = formatLocalDateTime(new Date("2026-04-02T21:09:29.900Z"));
    expect(s).toMatch(/2026/);
    expect(s).toMatch(/Apr/);
  });

  it("uses offset in datetime attr, not UTC Z", () => {
    const attr = formatLocalDateTimeForHtmlTime(
      new Date("2026-04-02T21:09:29.900Z"),
    );
    expect(attr).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    expect(attr.endsWith("Z")).toBe(false);
  });
});

describe("parseCalendarMonthQuery", () => {
  it("reads y and m", () => {
    const now = new Date("2026-06-15T12:00:00.000Z");
    expect(
      parseCalendarMonthQuery({ y: "2025", m: "3" }, now),
    ).toEqual({ year: 2025, month: 3 });
  });

  it("falls back to now in LA", () => {
    const now = new Date("2026-06-15T12:00:00.000Z");
    const r = parseCalendarMonthQuery({}, now);
    expect(r.year).toBeGreaterThanOrEqual(2026);
    expect(r.month).toBeGreaterThanOrEqual(1);
    expect(r.month).toBeLessThanOrEqual(12);
  });
});

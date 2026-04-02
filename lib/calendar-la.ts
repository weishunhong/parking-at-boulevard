import { getDaysInMonth } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { TZ } from "./env";
import { formatLaDateString } from "./la";

export function parseCalendarMonthQuery(
  sp: Record<string, string | string[] | undefined>,
  now: Date,
): { year: number; month: number } {
  const yRaw = sp["y"];
  const mRaw = sp["m"];
  const ys = Array.isArray(yRaw) ? yRaw[0] : yRaw;
  const ms = Array.isArray(mRaw) ? mRaw[0] : mRaw;
  if (ys && ms) {
    const year = Number(ys);
    const month = Number(ms);
    if (
      Number.isFinite(year) &&
      year >= 2000 &&
      year <= 2100 &&
      Number.isFinite(month) &&
      month >= 1 &&
      month <= 12
    ) {
      return { year, month };
    }
  }
  return {
    year: Number(formatInTimeZone(now, TZ, "yyyy")),
    month: Number(formatInTimeZone(now, TZ, "MM")),
  };
}

/** LA calendar month as UTC instants: [start, end). */
export function getLaMonthRangeUtcForCalendarMonth(
  year: number,
  month: number,
): { start: Date; endExclusive: Date } {
  const m = String(month).padStart(2, "0");
  const start = fromZonedTime(`${year}-${m}-01T00:00:00`, TZ);
  const nextMo = month === 12 ? 1 : month + 1;
  const nextY = month === 12 ? year + 1 : year;
  const nm = String(nextMo).padStart(2, "0");
  const endExclusive = fromZonedTime(`${nextY}-${nm}-01T00:00:00`, TZ);
  return { start, endExclusive };
}

export type LaCalendarCell = {
  day: number | null;
  /** `yyyy-MM-dd` in LA, or null for padding cells */
  dateKey: string | null;
};

/**
 * Sunday-first grid; trailing padding so length is a multiple of 7.
 */
export function buildLaCalendarGrid(
  year: number,
  month: number,
): LaCalendarCell[] {
  const m = String(month).padStart(2, "0");
  const first = fromZonedTime(`${year}-${m}-01T12:00:00`, TZ);
  const daysInMonth = getDaysInMonth(first);
  const isoDow = Number(formatInTimeZone(first, TZ, "i"));
  const leading = isoDow === 7 ? 0 : isoDow;

  const cells: LaCalendarCell[] = [];
  for (let i = 0; i < leading; i++) {
    cells.push({ day: null, dateKey: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${m}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, dateKey });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: null, dateKey: null });
  }
  return cells;
}

export function shiftCalendarMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const idx = year * 12 + (month - 1) + delta;
  const y = Math.floor(idx / 12);
  const mo = (idx % 12) + 1;
  return { year: y, month: mo };
}

export type RegistrationEventLike = {
  createdAt: Date | string;
};

export function groupEventsByLaDate<T extends RegistrationEventLike>(
  events: T[],
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const ev of events) {
    const key = formatLaDateString(new Date(ev.createdAt));
    const list = map.get(key) ?? [];
    list.push(ev);
    map.set(key, list);
  }
  for (const list of map.values()) {
    list.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }
  return map;
}

export function formatLaTimeLabel(iso: Date | string): string {
  return formatInTimeZone(new Date(iso), TZ, "h:mm a");
}

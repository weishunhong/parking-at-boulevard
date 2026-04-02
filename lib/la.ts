import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { TZ } from "./env";

export function formatLaDateString(date: Date): string {
  return formatInTimeZone(date, TZ, "yyyy-MM-dd");
}

/** Start of LA calendar month and start of next LA month (UTC instants). */
export function getLaMonthRangeUtc(now: Date): {
  start: Date;
  endExclusive: Date;
} {
  const ym = formatInTimeZone(now, TZ, "yyyy-MM");
  const start = fromZonedTime(`${ym}-01T00:00:00`, TZ);
  const [y, mo] = ym.split("-").map(Number);
  const nextMo = mo === 12 ? 1 : mo + 1;
  const nextY = mo === 12 ? y + 1 : y;
  const nextYm = `${nextY}-${String(nextMo).padStart(2, "0")}`;
  const endExclusive = fromZonedTime(`${nextYm}-01T00:00:00`, TZ);
  return { start, endExclusive };
}

export function getLaClock(now: Date): {
  hour: number;
  minute: number;
  second: number;
} {
  const h = formatInTimeZone(now, TZ, "H");
  const m = formatInTimeZone(now, TZ, "m");
  const s = formatInTimeZone(now, TZ, "s");
  return {
    hour: Number(h),
    minute: Number(m),
    second: Number(s),
  };
}

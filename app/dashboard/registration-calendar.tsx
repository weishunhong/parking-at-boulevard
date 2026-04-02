import Link from "next/link";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { TZ } from "@/lib/env";
import {
  buildLaCalendarGrid,
  shiftCalendarMonth,
} from "@/lib/calendar-la";

export type CalendarDayEvent = {
  id: string;
  timeLabel: string;
  status: "success" | "failure";
  trigger: "cron" | "manual";
  durationHours: number;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function RegistrationCalendar({
  year,
  month,
  todayLaKey,
  isViewingCurrentMonth,
  eventsByDay,
}: {
  year: number;
  month: number;
  todayLaKey: string;
  isViewingCurrentMonth: boolean;
  eventsByDay: Record<string, CalendarDayEvent[]>;
}) {
  const cells = buildLaCalendarGrid(year, month);
  const prev = shiftCalendarMonth(year, month, -1);
  const next = shiftCalendarMonth(year, month, 1);
  const title = formatInTimeZone(
    fromZonedTime(
      `${year}-${String(month).padStart(2, "0")}-01T12:00:00`,
      TZ,
    ),
    TZ,
    "MMMM yyyy",
  );

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Registration calendar (LA)
          </h2>
          {!isViewingCurrentMonth && (
            <Link
              href="/dashboard"
              className="text-xs font-medium text-sky-600 underline hover:text-sky-500 dark:text-sky-400"
            >
              Jump to this month
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard?y=${prev.year}&m=${prev.month}`}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            ← Prev
          </Link>
          <span className="min-w-[10rem] text-center text-sm font-medium text-zinc-800 dark:text-zinc-100">
            {title}
          </span>
          <Link
            href={`/dashboard?y=${next.year}&m=${next.month}`}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Next →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-700">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="bg-zinc-50 px-1 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 sm:text-xs"
          >
            {d}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (cell.day === null || cell.dateKey === null) {
            return (
              <div
                key={`pad-${i}`}
                className="min-h-[5.5rem] bg-zinc-50/80 dark:bg-zinc-950/50"
              />
            );
          }
          const dayEvents = eventsByDay[cell.dateKey] ?? [];
          const isToday = cell.dateKey === todayLaKey;
          return (
            <div
              key={cell.dateKey}
              className={`flex min-h-[5.5rem] flex-col gap-0.5 bg-white p-1 sm:p-1.5 dark:bg-zinc-950 ${
                isToday
                  ? "ring-1 ring-inset ring-sky-400/80 dark:ring-sky-500/70"
                  : ""
              }`}
            >
              <span
                className={`text-xs font-medium tabular-nums ${
                  isToday
                    ? "text-sky-600 dark:text-sky-400"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {cell.day}
              </span>
              <ul className="flex flex-1 flex-col gap-0.5">
                {dayEvents.map((ev) => (
                  <li
                    key={ev.id}
                    title={`${ev.trigger} · ${ev.durationHours} h · ${ev.status}`}
                    className={
                      ev.status === "success"
                        ? "truncate rounded border border-emerald-200/80 bg-emerald-50 px-1 py-0.5 text-[10px] leading-tight text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-100 sm:text-[11px]"
                        : "truncate rounded border border-rose-200/80 bg-rose-50 px-1 py-0.5 text-[10px] leading-tight text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-100 sm:text-[11px]"
                    }
                  >
                    <span className="font-medium">{ev.timeLabel}</span>
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {" "}
                      · {ev.trigger === "cron" ? "auto" : "manual"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        Times are{" "}
        <span className="font-medium text-zinc-600 dark:text-zinc-300">
          America/Los_Angeles
        </span>
        . Each chip is one run (success = green, failure = red).
      </p>
    </section>
  );
}

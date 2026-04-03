const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const TZ = process.env.TZ_DISPLAY ?? "America/Los_Angeles";
export const MONTHLY_HOUR_CAP = num(process.env.MONTHLY_HOUR_CAP, 168);
export const REGISTRATION_DURATION_HOURS = num(
  process.env.REGISTRATION_DURATION_HOURS,
  5,
);

/** Minute within the LA midnight window (hour 0–1): 0 = :00, 55 = :55. */
export const SCHEDULE_LA_WINDOW_START_MINUTE = num(
  process.env.SCHEDULE_LA_WINDOW_START_MINUTE,
  0,
);
export const SCHEDULE_LA_WINDOW_END_MINUTE = num(
  process.env.SCHEDULE_LA_WINDOW_END_MINUTE,
  55,
);

export function getCronSecret(): string | undefined {
  return process.env.CRON_SECRET;
}

export function getDashboardPassword(): string | undefined {
  return process.env.DASHBOARD_PASSWORD;
}

export function getSessionSecret(): string {
  return process.env.SESSION_SECRET ?? process.env.CRON_SECRET ?? "dev-only-secret";
}

/** `pro` = multiple cron ticks + random minute (Vercel Pro). `hobby` = one daily cron (Vercel Hobby). */
export type CronScheduleMode = "hobby" | "pro";

export function getCronScheduleMode(): CronScheduleMode {
  const m = process.env.CRON_SCHEDULE_MODE?.trim().toLowerCase();
  if (m === "pro") return "pro";
  return "hobby";
}

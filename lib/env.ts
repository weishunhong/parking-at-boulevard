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

/** Minute offset within the 2:00 LA hour (0 = 2:00, 55 = 2:55). */
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

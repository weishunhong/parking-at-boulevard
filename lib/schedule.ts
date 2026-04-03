import { ScheduleState } from "@/models/ScheduleState";
import { RegistrationEvent } from "@/models/RegistrationEvent";
import { connectDb } from "./db";
import {
  SCHEDULE_LA_WINDOW_END_MINUTE,
  SCHEDULE_LA_WINDOW_START_MINUTE,
  getCronScheduleMode,
} from "./env";
import { formatLaDateString, getLaClock } from "./la";
import { registerViaAutomation } from "./register";

function randomIntInclusive(min: number, max: number): number {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

export type CronRunResult =
  | { ok: true; skipped: true; reason: string; laDate?: string }
  | {
      ok: true;
      skipped: false;
      laDate: string;
      status: "success" | "failure";
      message: string;
    };

/** Cron is aligned to ~12:xx LA (see vercel.json). One UTC tick may fall in LA hour 0 or 1 (DST). */
function laHourAllowedForCron(clock: {
  hour: number;
  minute: number;
}): boolean {
  return clock.hour === 0 || clock.hour === 1;
}

export async function runScheduledAutoRegistration(
  now: Date = new Date(),
): Promise<CronRunResult> {
  await connectDb();

  const clock = getLaClock(now);
  const laDate = formatLaDateString(now);
  const mode = getCronScheduleMode();

  const wStart = SCHEDULE_LA_WINDOW_START_MINUTE;
  const wEnd = SCHEDULE_LA_WINDOW_END_MINUTE;

  if (!laHourAllowedForCron(clock)) {
    return {
      ok: true,
      skipped: true,
      reason: `outside_la_midnight_window (LA hour=${clock.hour}, mode=${mode})`,
      laDate,
    };
  }

  if (clock.minute < wStart || clock.minute > wEnd) {
    return {
      ok: true,
      skipped: true,
      reason: `outside_minute_window (LA minute=${clock.minute}, window ${wStart}-${wEnd})`,
      laDate,
    };
  }

  const rand = randomIntInclusive(wStart, wEnd);
  await ScheduleState.findOneAndUpdate(
    { laDate },
    {
      $setOnInsert: {
        laDate,
        targetMinute: mode === "hobby" ? clock.minute : rand,
        targetHourLa: clock.hour,
        autoRunCompletedAt: null,
        processing: false,
      },
    },
    { upsert: true },
  );

  const doc = await ScheduleState.findOne({ laDate }).lean();
  if (!doc) {
    return { ok: true, skipped: true, reason: "no_schedule_doc", laDate };
  }

  if (doc.autoRunCompletedAt) {
    return { ok: true, skipped: true, reason: "already_ran_today", laDate };
  }

  if (
    mode === "pro" &&
    clock.minute < doc.targetMinute
  ) {
    return {
      ok: true,
      skipped: true,
      reason: `before_target (now ${clock.minute} < ${doc.targetMinute})`,
      laDate,
    };
  }

  const lock =
    mode === "pro"
      ? await ScheduleState.findOneAndUpdate(
          {
            laDate,
            autoRunCompletedAt: null,
            targetMinute: { $lte: clock.minute },
            processing: { $ne: true },
          },
          { $set: { processing: true } },
          { new: true },
        )
      : await ScheduleState.findOneAndUpdate(
          {
            laDate,
            autoRunCompletedAt: null,
            processing: { $ne: true },
          },
          { $set: { processing: true } },
          { new: true },
        );

  if (!lock) {
    return { ok: true, skipped: true, reason: "claim_failed", laDate };
  }

  try {
    const result = await registerViaAutomation();
    await RegistrationEvent.create({
      createdAt: new Date(),
      status: result.success ? "success" : "failure",
      durationHours: result.durationHours,
      message: result.message,
      metadata: result.metadata,
      trigger: "cron",
    });
    await ScheduleState.updateOne(
      { laDate },
      {
        $set: {
          autoRunCompletedAt: new Date(),
          processing: false,
        },
      },
    );
    return {
      ok: true,
      skipped: false,
      laDate,
      status: result.success ? "success" : "failure",
      message: result.message,
    };
  } catch (e) {
    await ScheduleState.updateOne(
      { laDate },
      { $set: { processing: false } },
    );
    throw e;
  }
}

export async function runManualRegistration(): Promise<{
  status: "success" | "failure";
  message: string;
  durationHours: number;
}> {
  await connectDb();
  const result = await registerViaAutomation();
  await RegistrationEvent.create({
    createdAt: new Date(),
    status: result.success ? "success" : "failure",
    durationHours: result.durationHours,
    message: result.message,
    metadata: result.metadata,
    trigger: "manual",
  });
  return {
    status: result.success ? "success" : "failure",
    message: result.message,
    durationHours: result.durationHours,
  };
}

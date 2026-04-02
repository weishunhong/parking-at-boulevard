import { connectDb } from "./db";
import { MONTHLY_HOUR_CAP } from "./env";
import { getLaMonthRangeUtc } from "./la";
import { RegistrationEvent } from "@/models/RegistrationEvent";

export async function sumSuccessfulHoursThisLaMonth(
  now: Date = new Date(),
): Promise<number> {
  await connectDb();
  const { start, endExclusive } = getLaMonthRangeUtc(now);
  const agg = await RegistrationEvent.aggregate<{ total: number }>([
    {
      $match: {
        status: "success",
        createdAt: { $gte: start, $lt: endExclusive },
      },
    },
    { $group: { _id: null, total: { $sum: "$durationHours" } } },
  ]);
  return agg[0]?.total ?? 0;
}

export function remainingHoursThisMonth(used: number): number {
  return Math.max(0, MONTHLY_HOUR_CAP - used);
}

export async function monthSummary(now: Date = new Date()): Promise<{
  usedHours: number;
  remainingHours: number;
  cap: number;
}> {
  const used = await sumSuccessfulHoursThisLaMonth(now);
  return {
    usedHours: used,
    remainingHours: remainingHoursThisMonth(used),
    cap: MONTHLY_HOUR_CAP,
  };
}

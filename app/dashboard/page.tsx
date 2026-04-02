import Link from "next/link";
import { connectDb } from "@/lib/db";
import { formatLaDateString } from "@/lib/la";
import { monthSummary } from "@/lib/monthly";
import { RegistrationEvent } from "@/models/RegistrationEvent";
import { ScheduleState } from "@/models/ScheduleState";
import { DashboardActions } from "./dashboard-actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    await connectDb();
    const now = new Date();
    const laDate = formatLaDateString(now);
    const { usedHours, remainingHours, cap } = await monthSummary(now);
    const events = await RegistrationEvent.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();
    const sched = await ScheduleState.findOne({ laDate }).lean();

    return (
      <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Parking registration
            </h1>
            <p className="text-sm text-zinc-500">
              Month (LA): {usedHours.toFixed(1)} / {cap} h used ·{" "}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {remainingHours.toFixed(1)} h remaining
              </span>
            </p>
          </div>
          <DashboardActions />
        </header>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Today&apos;s schedule (LA)
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {sched
              ? `Target run: 2:${String(sched.targetMinute).padStart(2, "0")} · `
              : "No schedule row yet — first cron tick in the 2am window will create one. "}
            {sched?.autoRunCompletedAt
              ? `Auto run completed at ${new Date(sched.autoRunCompletedAt).toISOString()}`
              : "Auto run not completed yet today."}
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Recent events
          </h2>
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {events.length === 0 ? (
              <li className="px-4 py-6 text-sm text-zinc-500">No events yet.</li>
            ) : (
              events.map((ev) => (
                <li
                  key={String(ev._id)}
                  className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        ev.status === "success"
                          ? "rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                          : "rounded bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800 dark:bg-rose-950 dark:text-rose-200"
                      }
                    >
                      {ev.status}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {ev.trigger} · {ev.durationHours} h
                    </span>
                    <time className="text-xs text-zinc-500">
                      {new Date(ev.createdAt).toISOString()}
                    </time>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {ev.message}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>

        <p className="text-center text-xs text-zinc-400">
          <Link href="/" className="underline">
            Home
          </Link>
        </p>
      </div>
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-xl font-semibold">Database unavailable</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {message}
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
          <li>
            In Vercel → your project → <strong>Settings → Environment Variables</strong>
            , set <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">MONGODB_URI</code>{" "}
            to your <strong>MongoDB Atlas</strong> connection string (the same kind as{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">mongodb+srv://…</code>).
            Localhost-only URIs do not work on Vercel.
          </li>
          <li>
            In Atlas → <strong>Network Access</strong>, add <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">0.0.0.0/0</code>{" "}
            (or Vercel’s IPs) so serverless functions can connect.
          </li>
          <li>
            Redeploy after changing variables.
          </li>
        </ul>
        <p className="mt-6 text-sm">
          <Link href="/" className="text-zinc-600 underline dark:text-zinc-400">
            ← Home
          </Link>
        </p>
      </div>
    );
  }
}

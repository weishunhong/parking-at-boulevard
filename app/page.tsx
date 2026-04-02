import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-4 py-24">
      <h1 className="text-2xl font-semibold tracking-tight">
        parking-at-boulevard
      </h1>
      <p className="max-w-md text-center text-sm text-zinc-600 dark:text-zinc-400">
        Automated permit registration dashboard. Sign in to view monthly hours
        remaining and event history.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Dashboard
        </Link>
        <Link
          href="/api/health"
          className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm dark:border-zinc-700"
        >
          Health
        </Link>
      </div>
    </div>
  );
}

"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {error.message}
      </p>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        If this mentions MongoDB or{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          MONGODB_URI
        </code>
        , add your Atlas connection string in Vercel → Settings → Environment
        Variables, then redeploy. In Atlas → Network Access, allow connections
        from the internet (e.g. <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">0.0.0.0/0</code>{" "}
        for testing).
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Try again
      </button>
    </div>
  );
}

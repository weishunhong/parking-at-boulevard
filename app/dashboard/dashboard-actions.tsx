"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ActionMsg = {
  text: string;
  tone: "ok" | "err";
};

export function DashboardActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<ActionMsg | null>(null);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function manualRun() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/register/manual", { method: "POST" });
      const data = (await res.json()) as {
        status?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setMsg({
          text: data.error ?? "Request failed",
          tone: "err",
        });
        return;
      }
      const ok = data.status === "success";
      setMsg({
        text: `${data.status}: ${data.message ?? ""}`,
        tone: ok ? "ok" : "err",
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void manualRun()}
          disabled={loading}
          aria-busy={loading}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {loading ? "Running…" : "Run registration now"}
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-zinc-700"
        >
          Log out
        </button>
      </div>
      {msg ? (
        <div
          className="max-w-md sm:text-right"
          aria-live="polite"
          aria-atomic="true"
        >
          <p
            className={
              msg.tone === "ok"
                ? "text-xs text-emerald-700 dark:text-emerald-300"
                : "text-xs text-rose-700 dark:text-rose-300"
            }
          >
            {msg.text}
          </p>
        </div>
      ) : null}
    </div>
  );
}

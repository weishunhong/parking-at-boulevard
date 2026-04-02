"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DashboardActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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
        setMsg(data.error ?? "Request failed");
        return;
      }
      setMsg(`${data.status}: ${data.message ?? ""}`);
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
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {loading ? "Running…" : "Run registration now"}
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
        >
          Log out
        </button>
      </div>
      {msg ? <p className="max-w-md text-right text-xs text-zinc-500">{msg}</p> : null}
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { verifyDashboardCookie } from "@/lib/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await verifyDashboardCookie()) {
    redirect("/dashboard");
  }
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-4 py-16">
      <LoginForm />
      <Link href="/" className="text-sm text-zinc-500 underline">
        Home
      </Link>
    </div>
  );
}

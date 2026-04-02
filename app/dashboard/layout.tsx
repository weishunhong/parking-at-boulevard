import { redirect } from "next/navigation";
import { verifyDashboardCookie } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await verifyDashboardCookie())) {
    redirect("/login");
  }
  return <>{children}</>;
}

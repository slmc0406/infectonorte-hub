import { AdminDashboard } from "@/components/admin-dashboard";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

async function AdminContent() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return <AdminDashboard displayName={user.displayName} signOutPath="/api/admin-logout" />;
}

export default function AdminPage() { return <AdminContent />; }

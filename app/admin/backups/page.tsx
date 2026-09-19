import { BackupDashboard } from "@/components/backup-dashboard";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function BackupsPage() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return <BackupDashboard />;
}

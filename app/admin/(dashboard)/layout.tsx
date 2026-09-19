import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/session';
import { AdminSidebar } from '@/components/admin-sidebar';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin');

  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />
      <div className="flex-1">
        <nav className="flex gap-4 overflow-x-auto border-b border-border bg-white px-4 py-3 text-sm font-medium text-ink-soft md:hidden">
          <Link href="/admin/instituciones">Instituciones</Link>
          <Link href="/admin/contenido">Contenido</Link>
          <Link href="/admin/solicitudes">Solicitudes</Link>
          <Link href="/admin/analitica">Analítica</Link>
        </nav>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}

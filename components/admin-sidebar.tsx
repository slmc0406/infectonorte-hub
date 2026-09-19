'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, FileText, Inbox, BarChart3, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/admin/instituciones', label: 'Instituciones', icon: Building2 },
  { href: '/admin/contenido', label: 'Contenido', icon: FileText },
  { href: '/admin/solicitudes', label: 'Solicitudes', icon: Inbox },
  { href: '/admin/analitica', label: 'Analítica', icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.push('/admin');
    router.refresh();
  }

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-white md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-500 text-sm font-bold text-white">IN</span>
        <span className="font-semibold text-ink">Admin</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-primary-50 text-primary-700' : 'text-ink-soft hover:bg-surface-sunken'
              )}
            >
              <item.icon size={17} strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={logout}
        className="m-3 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-sunken"
      >
        <LogOut size={17} /> Salir
      </button>
    </aside>
  );
}

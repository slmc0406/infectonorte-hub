'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function PortalHeader({ slug, institutionName }: { slug: string; institutionName: string }) {
  const router = useRouter();

  async function logout() {
    await fetch(`/api/institutions/${slug}/session`, { method: 'DELETE' });
    router.push(`/i/${slug}`);
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
      <div className="container-hub flex h-16 items-center justify-between">
        <Link href={`/i/${slug}/portal`} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-500 text-sm font-bold text-white">
            IN
          </span>
          <span className="font-semibold tracking-tight text-ink">{institutionName}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-soft md:flex">
          <Link href={`/i/${slug}/portal/biblioteca`} className="hover:text-ink">Biblioteca institucional</Link>
        </nav>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-ink-soft hover:bg-surface-sunken"
        >
          <LogOut size={16} /> Salir
        </button>
      </div>
    </header>
  );
}

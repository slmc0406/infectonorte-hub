import { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import { AdminLoginForm } from '@/components/admin-login-form';

export const metadata: Metadata = { title: 'Panel administrativo', robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-500 text-white">
            <ShieldCheck size={22} strokeWidth={1.75} />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-ink">Infectonorte HUB — Administración</h1>
          <p className="mt-1 text-sm text-ink-soft">Acceso exclusivo para el equipo de Infectonorte</p>
        </div>
        <div className="mt-8 rounded-xl border border-border bg-white p-6 shadow-subtle">
          <AdminLoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-ink-faint">Demo: admin@infectonorte.com / admin1234</p>
      </div>
    </main>
  );
}

'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function InstitutionLoginForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/institutions/${slug}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'No pudimos verificar la contraseña.');
        setLoading(false);
        return;
      }
      router.push(`/i/${slug}/portal`);
      router.refresh();
    } catch {
      setError('No pudimos conectar. Verifica tu conexión e intenta de nuevo.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Contraseña institucional"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
        required
        error={error || undefined}
      />
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? 'Verificando…' : 'Ingresar'}
      </Button>
    </form>
  );
}

'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'No pudimos iniciar sesión.');
        setLoading(false);
        return;
      }
      router.push('/admin/instituciones');
      router.refresh();
    } catch {
      setError('No pudimos conectar. Intenta de nuevo.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
      <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required error={error || undefined} />
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? 'Verificando…' : 'Ingresar al panel'}
      </Button>
    </form>
  );
}

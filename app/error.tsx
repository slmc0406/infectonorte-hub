'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // En producción esto se envía a un servicio de monitoreo (Sentry o similar).
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-state-vencido/10 text-state-vencido">
        <AlertTriangle size={22} />
      </span>
      <h1 className="text-xl font-semibold text-ink">Algo salió mal</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        No pudimos cargar esta página. Puedes intentar de nuevo o volver más tarde.
      </p>
      <Button onClick={reset}>Intentar de nuevo</Button>
    </main>
  );
}

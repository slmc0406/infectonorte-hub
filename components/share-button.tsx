'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // el usuario canceló el share nativo — no hacer nada
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard puede fallar sin HTTPS/permiso — degradar en silencio
    }
  }

  return (
    <Button variant="secondary" size="md" onClick={handleShare}>
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? 'Enlace copiado' : 'Compartir'}
    </Button>
  );
}

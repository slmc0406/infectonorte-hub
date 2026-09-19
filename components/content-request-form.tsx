'use client';

import { FormEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export function ContentRequestForm() {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/content-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, description, contact }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No pudimos enviar tu solicitud.');
      }
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    }
  }

  if (status === 'done') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-white px-6 py-12 text-center">
        <CheckCircle2 size={28} className="text-state-vigente" />
        <p className="font-medium text-ink">¡Gracias! Recibimos tu solicitud.</p>
        <p className="text-sm text-ink-soft">El equipo de Infectonorte la revisará para priorizar nuevo contenido.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input label="¿Qué tema necesitas?" value={topic} onChange={(e) => setTopic(e.target.value)} required placeholder="Ej. Calculadora de ajuste renal" />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-soft" htmlFor="description">
          Cuéntanos un poco más
        </label>
        <textarea
          id="description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-border-strong bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          placeholder="¿Para qué lo necesitas? ¿En qué servicio o contexto?"
        />
      </div>
      <Input label="Correo de contacto (opcional)" type="email" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="tu@institucion.com" />
      {error && <p className="text-sm text-state-vencido">{error}</p>}
      <Button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Enviando…' : 'Enviar solicitud'}
      </Button>
    </form>
  );
}

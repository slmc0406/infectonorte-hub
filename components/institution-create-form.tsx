'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { termsByTaxonomy } from '@/data/taxonomy';

const serviceOptions = termsByTaxonomy('area');

export function InstitutionCreateForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [city, setCity] = useState('');
  const [department, setDepartment] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [password, setPassword] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleService(slug: string) {
    setServices((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, city, department, contactEmail, password, services }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'No pudimos crear la institución.');
        setLoading(false);
        return;
      }
      router.push(`/admin/instituciones/${data.institution.id}`);
      router.refresh();
    } catch {
      setError('No pudimos conectar. Intenta de nuevo.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Input label="Nombre de la institución" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input
        label="Slug (URL) — opcional, se genera del nombre si se deja vacío"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="clinica-ejemplo"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} required />
        <Input label="Departamento" value={department} onChange={(e) => setDepartment(e.target.value)} required />
      </div>
      <Input label="Correo de contacto (opcional)" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
      <Input
        label="Contraseña institucional inicial"
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="Mínimo 6 caracteres"
      />

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-soft">Servicios Infectonorte habilitados</p>
        <div className="flex flex-wrap gap-2">
          {serviceOptions.map((s) => (
            <button
              type="button"
              key={s.slug}
              onClick={() => toggleService(s.slug)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                services.includes(s.slug) ? 'border-primary-500 bg-primary-500 text-white' : 'border-border-strong bg-white text-ink-soft'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-state-vencido">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? 'Creando…' : 'Crear institución'}
      </Button>
    </form>
  );
}

'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { termsByTaxonomy } from '@/data/taxonomy';
import { typeLabels } from '@/lib/utils';
import { ResourceType, Visibility } from '@/lib/types';
import { institutions } from '@/data/institutions';

const typeOptions = Object.keys(typeLabels) as ResourceType[];
const areaOptions = termsByTaxonomy('area');
const populationOptions = termsByTaxonomy('poblacion');
const syndromeOptions = termsByTaxonomy('sindrome');

const visibilityOptions: { value: Visibility; label: string }[] = [
  { value: 'publico', label: 'Público (sin autenticación)' },
  { value: 'general_infectonorte', label: 'General Infectonorte (todas las instituciones)' },
  { value: 'instituciones_seleccionadas', label: 'Instituciones seleccionadas' },
  { value: 'exclusivo', label: 'Exclusivo de una institución' },
];

function MultiToggle({ options, value, onChange }: { options: { slug: string; label: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          type="button"
          key={o.slug}
          onClick={() => onChange(value.includes(o.slug) ? value.filter((v) => v !== o.slug) : [...value, o.slug])}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
            value.includes(o.slug) ? 'border-primary-500 bg-primary-500 text-white' : 'border-border-strong bg-white text-ink-soft'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ContentCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ResourceType>('algoritmo');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('general_infectonorte');
  const [ownerInstitutionId, setOwnerInstitutionId] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [populations, setPopulations] = useState<string[]>([]);
  const [syndromes, setSyndromes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(publish: boolean) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type,
          summary,
          description,
          visibility,
          ownerInstitutionId: visibility === 'exclusivo' ? ownerInstitutionId : undefined,
          areas,
          populations,
          syndromes,
          publish,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'No pudimos guardar el contenido.');
        setLoading(false);
        return;
      }
      router.push(`/admin/contenido/${data.resource.id}`);
      router.refresh();
    } catch {
      setError('No pudimos conectar. Intenta de nuevo.');
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        submit(false);
      }}
      className="space-y-5"
    >
      <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-soft">Tipo de contenido</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType)}
          className="w-full rounded-md border border-border-strong bg-white px-3.5 py-2.5 text-sm text-ink focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        >
          {typeOptions.map((t) => (
            <option key={t} value={t}>{typeLabels[t]}</option>
          ))}
        </select>
      </div>

      <Input label="Resumen (una línea)" value={summary} onChange={(e) => setSummary(e.target.value)} />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-soft">Resumen clínico / descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full rounded-md border border-border-strong bg-white px-3.5 py-2.5 text-sm text-ink focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-soft">Área</p>
        <MultiToggle options={areaOptions} value={areas} onChange={setAreas} />
      </div>
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-soft">Población</p>
        <MultiToggle options={populationOptions} value={populations} onChange={setPopulations} />
      </div>
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-soft">Síndrome</p>
        <MultiToggle options={syndromeOptions} value={syndromes} onChange={setSyndromes} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-soft">Visibilidad</label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as Visibility)}
          className="w-full rounded-md border border-border-strong bg-white px-3.5 py-2.5 text-sm text-ink focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        >
          {visibilityOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {visibility === 'exclusivo' && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-soft">Institución propietaria</label>
          <select
            value={ownerInstitutionId}
            onChange={(e) => setOwnerInstitutionId(e.target.value)}
            className="w-full rounded-md border border-border-strong bg-white px-3.5 py-2.5 text-sm text-ink focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="">Selecciona una institución</option>
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
        </div>
      )}

      {error && <p className="text-sm text-state-vencido">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" variant="secondary" disabled={loading}>
          Guardar como borrador
        </Button>
        <Button type="button" onClick={() => submit(true)} disabled={loading}>
          Publicar
        </Button>
      </div>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Resource, ResourceStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { statusMeta } from '@/lib/utils';

const statusOptions: ResourceStatus[] = ['borrador', 'vigente', 'proximo_revision', 'en_revision', 'vencido', 'archivado'];

export function ContentEditPanel({ resource }: { resource: Resource }) {
  const router = useRouter();
  const [status, setStatus] = useState<ResourceStatus>(resource.status);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function save(publish = false) {
    setSaving(true);
    setMsg('');
    const res = await fetch(`/api/admin/content/${resource.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(publish ? { publish: true } : { status }),
    });
    if (res.ok) {
      setMsg('Cambios guardados.');
      router.refresh();
    } else {
      setMsg('No pudimos guardar los cambios.');
    }
    setSaving(false);
  }

  return (
    <Card className="p-6">
      <h2 className="font-semibold text-ink">Estado de publicación</h2>
      <div className="mt-3 flex items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ResourceStatus)}
          className="rounded-md border border-border-strong bg-white px-3 py-2 text-sm text-ink"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{statusMeta[s].label}</option>
          ))}
        </select>
        <Button size="sm" variant="secondary" onClick={() => save(false)} disabled={saving}>
          Guardar estado
        </Button>
        {resource.status === 'borrador' && (
          <Button size="sm" onClick={() => save(true)} disabled={saving}>
            Publicar ahora
          </Button>
        )}
      </div>
      {msg && <p className="mt-2 text-sm text-ink-soft">{msg}</p>}
    </Card>
  );
}

import Link from 'next/link';
import { Metadata } from 'next';
import { Plus } from 'lucide-react';
import { getAllResourcesAdmin } from '@/data/resources';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, DemoBadge } from '@/components/ui/badge';
import { typeLabels } from '@/lib/utils';

export const metadata: Metadata = { title: 'Contenido · Admin', robots: { index: false, follow: false } };

const visibilityLabels: Record<string, string> = {
  publico: 'Público',
  general_infectonorte: 'General Infectonorte',
  instituciones_seleccionadas: 'Instituciones seleccionadas',
  exclusivo: 'Exclusivo',
};

export default function AdminContentPage() {
  const resources = [...getAllResourcesAdmin()].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Contenido</h1>
          <p className="mt-1 text-sm text-ink-soft">{resources.length} recursos en la plataforma.</p>
        </div>
        <Button href="/admin/contenido/nuevo">
          <Plus size={16} /> Nuevo contenido
        </Button>
      </div>

      <div className="mt-8 space-y-3">
        {resources.map((r) => (
          <Link key={r.id} href={`/admin/contenido/${r.id}`}>
            <Card className="flex items-center justify-between gap-4 p-4 hover:shadow-float transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink">{r.title}</p>
                  {r.isDemo && <DemoBadge />}
                </div>
                <p className="mt-0.5 text-sm text-ink-faint">
                  {typeLabels[r.type]} · {visibilityLabels[r.visibility]}
                  {r.institutionName ? ` · ${r.institutionName}` : ''}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

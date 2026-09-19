import Link from 'next/link';
import { Metadata } from 'next';
import { Plus, MapPin } from 'lucide-react';
import { institutions } from '@/data/institutions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DemoBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Instituciones · Admin', robots: { index: false, follow: false } };

export default function AdminInstitutionsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Instituciones</h1>
          <p className="mt-1 text-sm text-ink-soft">{institutions.length} institución(es) registradas.</p>
        </div>
        <Button href="/admin/instituciones/nueva">
          <Plus size={16} /> Nueva institución
        </Button>
      </div>

      <div className="mt-8 space-y-3">
        {institutions.map((inst) => (
          <Link key={inst.id} href={`/admin/instituciones/${inst.id}`}>
            <Card className="flex items-center gap-4 p-4 hover:shadow-float transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink">{inst.name}</p>
                  {inst.isDemo && <DemoBadge />}
                </div>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-faint">
                  <MapPin size={13} /> {inst.city}, {inst.department} · /i/{inst.slug}
                </p>
              </div>
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-medium',
                  inst.status === 'activa' ? 'bg-state-vigente/10 text-state-vigente' : 'bg-state-archivado/10 text-state-archivado'
                )}
              >
                {inst.status === 'activa' ? 'Activa' : 'Inactiva'}
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

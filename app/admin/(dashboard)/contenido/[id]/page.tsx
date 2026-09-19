import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { ExternalLink } from 'lucide-react';
import { getResourceById } from '@/data/resources';
import { ContentEditPanel } from '@/components/content-edit-panel';
import { StatusBadge, DemoBadge } from '@/components/ui/badge';
import { typeLabels } from '@/lib/utils';

export const metadata: Metadata = { title: 'Editar contenido · Admin', robots: { index: false, follow: false } };

export default function EditContentPage({ params }: { params: { id: string } }) {
  const resource = getResourceById(params.id);
  if (!resource) notFound();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold text-ink">{resource.title}</h1>
        {resource.isDemo && <DemoBadge />}
      </div>
      <div className="mt-2 flex items-center gap-3">
        <StatusBadge status={resource.status} />
        <span className="text-sm text-ink-faint">{typeLabels[resource.type]} · v{resource.version}</span>
      </div>

      {resource.visibility !== 'exclusivo' && resource.status !== 'borrador' && (
        <Link
          href={`/${resource.typePath}/${resource.slug}`}
          target="_blank"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline"
        >
          Ver en la biblioteca pública <ExternalLink size={13} />
        </Link>
      )}

      <div className="mt-8">
        <ContentEditPanel resource={resource} />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-white p-6">
        <h2 className="font-semibold text-ink">Resumen</h2>
        <p className="mt-2 text-sm text-ink-soft">{resource.summary || 'Sin resumen.'}</p>
      </div>
    </div>
  );
}

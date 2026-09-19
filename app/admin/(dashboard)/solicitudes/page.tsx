import { Metadata } from 'next';
import { contentRequests } from '@/data/content-requests';
import { getInstitutionById } from '@/data/institutions';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Solicitudes · Admin', robots: { index: false, follow: false } };

const statusLabels: Record<string, { label: string; tone: string }> = {
  nueva: { label: 'Nueva', tone: 'bg-primary-50 text-primary-700' },
  agrupada: { label: 'Agrupada', tone: 'bg-accent-100 text-accent-700' },
  en_desarrollo: { label: 'En desarrollo', tone: 'bg-state-revision/10 text-state-revision' },
  publicada: { label: 'Publicada', tone: 'bg-state-vigente/10 text-state-vigente' },
  descartada: { label: 'Descartada', tone: 'bg-state-archivado/10 text-state-archivado' },
};

export default function AdminRequestsPage() {
  const sorted = [...contentRequests].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Solicitudes de contenido</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Solicitudes enviadas desde &ldquo;¿No encontraste lo que buscabas?&rdquo;, agrupadas por tema similar.
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse overflow-hidden rounded-lg border border-border bg-white text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-sunken text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3">Tema</th>
              <th className="px-4 py-3">Institución</th>
              <th className="px-4 py-3">Cantidad</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((req) => {
              const institution = req.institutionId ? getInstitutionById(req.institutionId) : null;
              const status = statusLabels[req.status];
              return (
                <tr key={req.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{req.topic}</p>
                    <p className="text-xs text-ink-faint">{req.description}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{institution?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-ink-soft">{req.count}</td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', status.tone)}>{status.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

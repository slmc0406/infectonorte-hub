import Link from 'next/link';
import { Download, FileText, ArrowRight } from 'lucide-react';
import { Resource } from '@/lib/types';
import { StatusBadge, DemoBadge, Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShareButton } from '@/components/share-button';
import { ResourceCard } from '@/components/resource-card';
import { AntibiogramChart } from '@/components/antibiogram-chart';
import { antibiogramData } from '@/data/demo-antibiogram';
import { termLabel } from '@/data/taxonomy';
import { typeLabels, formatDate } from '@/lib/utils';
import { getRelatedResources } from '@/data/resources';

export function ResourceDetail({ resource, basePath = '' }: { resource: Resource; basePath?: string }) {
  const related = getRelatedResources(resource);
  const chartData = antibiogramData[resource.slug];

  return (
    <article className="container-hub max-w-4xl py-10">
      <nav className="mb-6 text-sm text-ink-faint">
        <Link href={basePath || '/'} className="hover:text-ink">Inicio</Link>
        {' / '}
        <Link href={`${basePath}/biblioteca`} className="hover:text-ink">Biblioteca</Link>
        {' / '}
        <span className="text-ink">{resource.title}</span>
      </nav>

      <div className="flex flex-wrap items-center gap-2">
        <Badge>{typeLabels[resource.type]}</Badge>
        {resource.areas.map((a) => <Badge key={a}>{termLabel(a)}</Badge>)}
        {resource.syndromes.map((s) => <Badge key={s}>{termLabel(s)}</Badge>)}
        {resource.populations.map((p) => <Badge key={p}>{termLabel(p)}</Badge>)}
        {resource.isDemo && <DemoBadge />}
      </div>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">{resource.title}</h1>
      <p className="mt-2 text-lg text-ink-soft">{resource.summary}</p>

      <div className="mt-4">
        <StatusBadge status={resource.status} />
      </div>

      {resource.presentation && (
        <p className="mt-3 text-sm text-ink-soft">
          <span className="font-medium text-ink">{resource.presentation.speaker}</span> · {resource.presentation.event} ·{' '}
          {formatDate(resource.presentation.sessionDate)}
        </p>
      )}

      {resource.institutionName && (
        <p className="mt-3 text-sm text-ink-faint">
          Contenido exclusivo de <span className="font-medium text-ink">{resource.institutionName}</span>
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button size="lg">
          <FileText size={16} /> Ver {resource.type === 'algoritmo' ? 'algoritmo' : 'documento'}
        </Button>
        <Button variant="secondary" size="lg">
          <Download size={16} /> Descargar
        </Button>
        <ShareButton title={resource.title} />
      </div>

      {resource.isDemo && (
        <div className="mt-6 rounded-md border border-accent-300 bg-accent-100 px-4 py-3 text-sm font-medium text-accent-700">
          CONTENIDO DEMOSTRATIVO — NO UTILIZAR PARA DECISIONES CLÍNICAS
        </div>
      )}

      {chartData && (
        <Card className="mt-8 p-6">
          <h2 className="mb-4 text-lg font-semibold text-ink">Gráfica interactiva</h2>
          <AntibiogramChart data={chartData} />
        </Card>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Resumen clínico</h2>
        <p className="mt-2 whitespace-pre-line text-ink-soft">{resource.description}</p>
      </section>

      {resource.keyPoints.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-ink">Puntos clave</h2>
          <ul className="mt-3 space-y-2">
            {resource.keyPoints.map((point, i) => (
              <li key={i} className="flex gap-2 text-ink-soft">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                {point}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10 grid grid-cols-1 gap-6 rounded-lg border border-border bg-surface-sunken p-6 sm:grid-cols-2">
        <InfoItem label="Versión" value={resource.version} />
        <InfoItem label="Publicación" value={formatDate(resource.publishedAt)} />
        <InfoItem label="Última revisión" value={formatDate(resource.lastReviewedAt)} />
        <InfoItem label="Próxima revisión" value={formatDate(resource.nextReviewAt)} />
        <InfoItem
          label="Autores"
          value={resource.authors.filter((a) => a.role === 'autor').map((a) => a.author.name).join(', ') || '—'}
        />
        <InfoItem
          label="Revisores"
          value={resource.authors.filter((a) => a.role === 'revisor').map((a) => a.author.name).join(', ') || '—'}
        />
      </section>

      {resource.references.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-ink">Referencias</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink-soft">
            {resource.references.map((ref, i) => <li key={i}>{ref}</li>)}
          </ol>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink">Historial de versiones</h2>
        <div className="mt-3 rounded-lg border border-border bg-white">
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="font-medium text-ink">v{resource.version} — actual</span>
            <span className="text-ink-faint">{formatDate(resource.lastReviewedAt)}</span>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Material relacionado</h2>
            <ArrowRight size={16} className="text-ink-faint" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {related.map((r) => <ResourceCard key={r.id} resource={r} basePath={basePath} />)}
          </div>
        </section>
      )}
    </article>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1 text-sm text-ink">{value}</p>
    </div>
  );
}

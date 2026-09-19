import { Metadata } from 'next';
import { getAnalyticsSummary } from '@/lib/analytics';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Analítica · Admin', robots: { index: false, follow: false } };

export default function AdminAnalyticsPage() {
  const summary = getAnalyticsSummary();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Analítica</h1>
      <p className="mt-1 max-w-lg text-sm text-ink-soft">
        Registro respetuoso y anónimo de uso — sin datos de pacientes. Sirve para decidir qué contenido nuevo
        desarrollar.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-semibold text-ink">Contenido más consultado</h2>
          <ul className="mt-4 space-y-3">
            {summary.topResources.map(({ resource, count }) => (
              <li key={resource.id} className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">{resource.title}</span>
                <span className="font-medium text-ink">{count}</span>
              </li>
            ))}
            {summary.topResources.length === 0 && <p className="text-sm text-ink-faint">Aún no hay datos.</p>}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-ink">Instituciones más activas</h2>
          <ul className="mt-4 space-y-3">
            {summary.topInstitutions.map(({ institution, count }) => (
              <li key={institution.id} className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">{institution.name}</span>
                <span className="font-medium text-ink">{count}</span>
              </li>
            ))}
            {summary.topInstitutions.length === 0 && <p className="text-sm text-ink-faint">Aún no hay datos.</p>}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-ink">Búsquedas frecuentes</h2>
          <ul className="mt-4 space-y-3">
            {summary.topSearches.map(({ query, count }) => (
              <li key={query} className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">&ldquo;{query}&rdquo;</span>
                <span className="font-medium text-ink">{count}</span>
              </li>
            ))}
            {summary.topSearches.length === 0 && <p className="text-sm text-ink-faint">Aún no hay datos.</p>}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-ink">Búsquedas sin resultados</h2>
          <p className="mt-1 text-xs text-ink-faint">Oportunidades claras de nuevo contenido.</p>
          <ul className="mt-4 space-y-3">
            {summary.noResultSearches.map(({ query, count }) => (
              <li key={query} className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">&ldquo;{query}&rdquo;</span>
                <span className="font-medium text-state-vencido">{count}</span>
              </li>
            ))}
            {summary.noResultSearches.length === 0 && <p className="text-sm text-ink-faint">Aún no hay datos.</p>}
          </ul>
        </Card>
      </div>
    </div>
  );
}

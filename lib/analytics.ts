import { AnalyticsSummary } from './types';
import { resources } from '@/data/resources';
import { institutions } from '@/data/institutions';

// Registro de analítica respetuosa (sin PII, sin datos de pacientes) — ver
// tabla `analytics_events` en el modelo de datos. Implementación en memoria
// para el MVP demo: en producción esto es un INSERT a Postgres y el resumen
// se calcula con una vista agregada. La interfaz (logEvent / getAnalyticsSummary)
// no cambia al migrar.
export type EventType = 'view' | 'download' | 'search' | 'search_no_results';

interface StoredEvent {
  type: EventType;
  resourceId?: string;
  institutionId?: string;
  query?: string;
  createdAt: string;
}

// Semillas demo para que el panel de administración no se vea vacío en el MVP.
const events: StoredEvent[] = [
  { type: 'view', resourceId: 'res-2', createdAt: new Date().toISOString() },
  { type: 'view', resourceId: 'res-1', createdAt: new Date().toISOString() },
  { type: 'view', resourceId: 'res-6', createdAt: new Date().toISOString() },
  { type: 'search', query: 'antibiograma uci', createdAt: new Date().toISOString() },
  { type: 'search', query: 'itu embarazo', createdAt: new Date().toISOString() },
  { type: 'search', query: 'meningitis', createdAt: new Date().toISOString() },
  { type: 'search_no_results', query: 'calculadora renal', createdAt: new Date().toISOString() },
  { type: 'search_no_results', query: 'neutropenia febril', createdAt: new Date().toISOString() },
  { type: 'view', resourceId: 'res-13', institutionId: 'inst-demo-norte', createdAt: new Date().toISOString() },
];

export function logEvent(event: Omit<StoredEvent, 'createdAt'>) {
  events.push({ ...event, createdAt: new Date().toISOString() });
}

function countBy<T extends string>(items: (T | undefined)[]): Map<T, number> {
  const map = new Map<T, number>();
  for (const item of items) {
    if (!item) continue;
    map.set(item, (map.get(item) ?? 0) + 1);
  }
  return map;
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const resourceCounts = countBy(events.filter((e) => e.type === 'view').map((e) => e.resourceId));
  const institutionCounts = countBy(events.map((e) => e.institutionId));
  const searchCounts = countBy(events.filter((e) => e.type === 'search').map((e) => e.query));
  const noResultCounts = countBy(events.filter((e) => e.type === 'search_no_results').map((e) => e.query));

  const topResources = [...resourceCounts.entries()]
    .map(([id, count]) => ({ resource: resources.find((r) => r.id === id)!, count }))
    .filter((x) => x.resource)
    .sort((a, b) => b.count - a.count);

  const topInstitutions = [...institutionCounts.entries()]
    .map(([id, count]) => ({ institution: institutions.find((i) => i.id === id)!, count }))
    .filter((x) => x.institution)
    .sort((a, b) => b.count - a.count);

  const topSearches = [...searchCounts.entries()].map(([query, count]) => ({ query, count })).sort((a, b) => b.count - a.count);
  const noResultSearches = [...noResultCounts.entries()].map(([query, count]) => ({ query, count })).sort((a, b) => b.count - a.count);

  return { topResources, topInstitutions, topSearches, noResultSearches };
}

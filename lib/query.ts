import { SearchFilters } from './search';

type SP = Record<string, string | string[] | undefined>;

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export function parseSearchFilters(searchParams: SP): SearchFilters {
  return {
    poblacion: toArray(searchParams.poblacion),
    area: toArray(searchParams.area),
    sindrome: toArray(searchParams.sindrome),
    tipo: toArray(searchParams.tipo) as SearchFilters['tipo'],
    tag: toArray(searchParams.tag),
  };
}

export function parseQuery(searchParams: SP): string {
  const q = searchParams.q;
  return Array.isArray(q) ? q[0] ?? '' : q ?? '';
}

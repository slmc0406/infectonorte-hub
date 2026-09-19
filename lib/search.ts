import { Resource } from './types';
import { termLabel, tagLabel } from '@/data/taxonomy';

// Búsqueda tolerante a errores para la capa demo (sin base de datos).
// En producción esto se reemplaza por Postgres: columna generada tsvector +
// índice GIN, más pg_trgm para similitud (ver db/schema.sql). La interfaz
// pública (searchResources) no cambia al migrar, solo la implementación.

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

// Distancia de edición simple, acotada, para tolerar 1-2 typos en palabras cortas.
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 3) return 99; // corta rápido si la diferencia de longitud es grande
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

function fuzzyIncludes(haystack: string, needle: string): boolean {
  const hn = normalize(haystack);
  const nn = normalize(needle);
  if (hn.includes(nn)) return true;
  const words = hn.split(/\s+/);
  return words.some((w) => w.length > 3 && nn.length > 3 && levenshtein(w, nn) <= 1);
}

export interface SearchFilters {
  poblacion?: string[];
  area?: string[];
  sindrome?: string[];
  tipo?: string[];
  tag?: string[];
}

export function searchResources(resources: Resource[], query: string, filters: SearchFilters = {}): Resource[] {
  let results = resources;

  if (filters.poblacion?.length) results = results.filter((r) => r.populations.some((p) => filters.poblacion!.includes(p)));
  if (filters.area?.length) results = results.filter((r) => r.areas.some((a) => filters.area!.includes(a)));
  if (filters.sindrome?.length) results = results.filter((r) => r.syndromes.some((s) => filters.sindrome!.includes(s)));
  if (filters.tipo?.length) results = results.filter((r) => filters.tipo!.includes(r.type));
  if (filters.tag?.length) results = results.filter((r) => r.tags.some((t) => filters.tag!.includes(t)));

  const q = query.trim();
  if (!q) return results;

  const searchable = (r: Resource) =>
    [
      r.title,
      r.summary,
      r.description,
      r.institutionName ?? '',
      ...r.areas.map(termLabel),
      ...r.syndromes.map(termLabel),
      ...r.populations.map(termLabel),
      ...r.tags.map(tagLabel),
      r.type,
    ].join(' ');

  return results
    .map((r) => ({ r, hay: searchable(r) }))
    .filter(({ hay }) => q.split(/\s+/).every((term) => fuzzyIncludes(hay, term)))
    .map(({ r }) => r);
}

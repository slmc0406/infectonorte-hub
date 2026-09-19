'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { termsByTaxonomy } from '@/data/taxonomy';
import { cn } from '@/lib/utils';
import { typeLabels } from '@/lib/utils';
import { ResourceType } from '@/lib/types';

const typeOptions: { slug: string; label: string }[] = (
  Object.keys(typeLabels) as ResourceType[]
).map((t) => ({ slug: t, label: typeLabels[t] }));

const filterGroups: { key: 'poblacion' | 'area' | 'sindrome' | 'tipo'; title: string; options: { slug: string; label: string }[] }[] = [
  { key: 'poblacion', title: 'Población', options: termsByTaxonomy('poblacion').map((t) => ({ slug: t.slug, label: t.label })) },
  { key: 'area', title: 'Área', options: termsByTaxonomy('area').map((t) => ({ slug: t.slug, label: t.label })) },
  { key: 'sindrome', title: 'Síndrome', options: termsByTaxonomy('sindrome').map((t) => ({ slug: t.slug, label: t.label })) },
  { key: 'tipo', title: 'Tipo', options: typeOptions },
];

export function FilterPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function toggle(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(key);
    params.delete(key);
    if (current.includes(value)) {
      current.filter((v) => v !== value).forEach((v) => params.append(key, v));
    } else {
      [...current, value].forEach((v) => params.append(key, v));
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function isActive(key: string, value: string) {
    return searchParams.getAll(key).includes(value);
  }

  const hasActiveFilters = filterGroups.some((g) => searchParams.getAll(g.key).length > 0);

  return (
    <div className="space-y-6">
      {hasActiveFilters && (
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            filterGroups.forEach((g) => params.delete(g.key));
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
          }}
          className="text-sm font-medium text-primary-600 hover:underline"
        >
          Limpiar filtros
        </button>
      )}
      {filterGroups.map((group) => (
        <div key={group.key}>
          <h3 className="mb-2 text-sm font-semibold text-ink">{group.title}</h3>
          <div className="flex flex-wrap gap-2">
            {group.options.map((opt) => (
              <button
                key={opt.slug}
                onClick={() => toggle(group.key, opt.slug)}
                aria-pressed={isActive(group.key, opt.slug)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive(group.key, opt.slug)
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-border-strong bg-white text-ink-soft hover:border-primary-300'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

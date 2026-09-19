'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Suggestion {
  slug: string;
  typePath: string;
  title: string;
  type: string;
}

const RECENT_KEY = 'ih_recent_searches';

function getRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function pushRecent(q: string) {
  if (typeof window === 'undefined') return;
  try {
    const current = getRecent().filter((x) => x !== q);
    localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...current].slice(0, 5)));
  } catch {
    // localStorage puede fallar en modo incógnito estricto — degradar sin romper la búsqueda.
  }
}

export function SearchBar({
  placeholder = 'Buscar algoritmos, guías, microorganismos, antibióticos...',
  action = '/buscar',
  size = 'lg',
  autoFocus = false,
}: {
  placeholder?: string;
  action?: string;
  size?: 'md' | 'lg';
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecent(getRecent());
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.results ?? []);
      } catch {
        setSuggestions([]);
      }
    }, 180);
    return () => clearTimeout(timeout);
  }, [query]);

  function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    pushRecent(trimmed);
    setOpen(false);
    router.push(`${action}?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        className="relative"
      >
        <Search
          size={size === 'lg' ? 20 : 18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          autoFocus={autoFocus}
          placeholder={placeholder}
          aria-label="Buscar en Infectonorte HUB"
          className={cn(
            'w-full rounded-xl border border-border-strong bg-white pl-11 pr-11 text-ink placeholder:text-ink-faint shadow-subtle',
            'focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100',
            size === 'lg' ? 'h-14 text-base' : 'h-11 text-sm'
          )}
        />
        {query && (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink-faint hover:bg-surface-sunken"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {open && (suggestions.length > 0 || recent.length > 0) && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-border bg-white shadow-float animate-fade-in">
          {suggestions.length > 0 && (
            <ul>
              {suggestions.map((s) => (
                <li key={s.slug}>
                  <button
                    onClick={() => submit(s.title)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-surface-sunken"
                  >
                    <span className="text-ink">{s.title}</span>
                    <span className="text-xs text-ink-faint">{s.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {suggestions.length === 0 && recent.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-ink-faint">Búsquedas recientes</p>
              <ul>
                {recent.map((r) => (
                  <li key={r}>
                    <button
                      onClick={() => submit(r)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-ink-soft hover:bg-surface-sunken"
                    >
                      <Search size={14} className="text-ink-faint" /> {r}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

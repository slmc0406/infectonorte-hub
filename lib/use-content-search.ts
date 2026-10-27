"use client";
import { useEffect, useState } from "react";

export type ContentHit = { rank: number; snippet: string };

/** Busca dentro del texto de los documentos (con espera de 300 ms entre teclas). */
export function useContentSearch(query: string) {
  const [state, setState] = useState<{ query: string; hits: Map<string, ContentHit> }>({ query: "", hits: new Map() });
  const term = query.trim();
  useEffect(() => {
    if (term.length < 3) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        if (!response.ok) return;
        const payload = await response.json() as { hits: { id: string; rank: number; snippet: string }[] };
        setState({ query: term, hits: new Map(payload.hits.map((hit) => [hit.id, { rank: hit.rank, snippet: hit.snippet }])) });
      } catch { /* cancelada o sin red */ }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [term]);
  return term.length >= 3 && state.query === term ? state.hits : new Map<string, ContentHit>();
}

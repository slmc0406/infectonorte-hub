"use client";

import { Bell, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { formatCatalogDate } from "@/lib/format";

type NewsResource = { id: string; title: string; category: string; version: number; createdAt: number; updatedAt: number; visibility: string };

const DAY = 24 * 60 * 60 * 1000;
// Primera lectura por navegador y por institución: la lista de esta visita no cambia aunque la marca se reescriba.
const firstReads = new Map<string, string>();
function firstRead(key: string) {
  if (!firstReads.has(key)) firstReads.set(key, readLastVisit(key)?.toString() ?? "");
  return firstReads.get(key) as string;
}

function readLastVisit(key: string) {
  try { const value = window.localStorage.getItem(key); return value ? Number(value) : null; } catch { return null; }
}
function writeLastVisit(key: string) {
  try { window.localStorage.setItem(key, String(Date.now())); } catch { /* almacenamiento no disponible */ }
}

/** Qué se publicó o actualizó desde la última vez que esta institución (en este navegador) entró al portal. */
export function InstitutionNews({ slug, resources }: { slug: string; resources: NewsResource[] }) {
  const storageKey = `hub:last-visit:${slug}`;
  // Se lee una sola vez al cargar (la marca se reescribe a los 10 s, pero la lista de esta visita no cambia).
  const raw = useSyncExternalStore(() => () => undefined, () => firstRead(storageKey), () => null);
  const [dismissed, setDismissed] = useState(false);
  const [mountedAt] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setTimeout(() => writeLastVisit(storageKey), 10_000);
    const onHide = () => writeLastVisit(storageKey);
    window.addEventListener("pagehide", onHide);
    return () => { window.clearTimeout(timer); window.removeEventListener("pagehide", onHide); };
  }, [storageKey]);

  const visit = raw === null ? null : { lastVisit: raw ? Number(raw) : null, since: raw ? Number(raw) : mountedAt - 30 * DAY };
  const since = visit ? visit.since : null;
  const lastVisit = visit ? visit.lastVisit : null;
  const items = since === null ? [] : resources.filter((item) => item.updatedAt > since).sort((a, b) => b.updatedAt - a.updatedAt);

  if (dismissed || since === null || items.length === 0) return null;
  const shown = items.slice(0, 6);
  return <section className="institution-news" aria-labelledby="news-heading">
    <div className="institution-news-head">
      <span className="news-icon"><Bell size={17} /></span>
      <div>
        <h2 id="news-heading">{items.length} {items.length === 1 ? "novedad" : "novedades"} {lastVisit ? `desde tu última visita (${formatCatalogDate(lastVisit)})` : "en los últimos 30 días"}</h2>
        <p>Documentos nuevos o actualizados que puedes consultar.</p>
      </div>
      <button type="button" className="news-dismiss" onClick={() => { writeLastVisit(storageKey); setDismissed(true); }} aria-label="Marcar novedades como vistas"><X size={15} />Marcar como vistas</button>
    </div>
    <ul>
      {shown.map((item) => {
        const isNew = !lastVisit ? item.createdAt >= since : item.createdAt > lastVisit;
        return <li key={item.id}>
          <a href={`/api/resources/${item.id}`} target="_blank" rel="noreferrer">
            <span className={isNew ? "news-tag is-new" : "news-tag"}>{isNew ? "Nuevo" : "Actualizado"}</span>
            <strong>{item.title}</strong>
            <small>{item.visibility === "institution" ? "Tu institución · " : ""}{item.category} · {formatCatalogDate(item.updatedAt)}</small>
          </a>
        </li>;
      })}
    </ul>
    {items.length > shown.length && <p className="news-more">y {items.length - shown.length} más en la biblioteca.</p>}
  </section>;
}

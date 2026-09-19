"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, DatabaseBackup, HardDrive, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import { EcosystemBrand } from "./brand";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Backup = { id: string; status: string; institutionCount: number; resourceCount: number; fileCount: number; createdBy: string; createdAt: number; restoredBy: string | null; restoredAt: number | null };

export function BackupDashboard() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/backups", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "No fue posible consultar las copias.");
    setBackups(payload.backups || []);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/backups", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "No fue posible consultar las copias.");
        return payload.backups as Backup[];
      })
      .then((items) => { if (active) setBackups(items || []); })
      .catch((reason) => { if (active) setError(reason.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function createBackup() {
    setWorking(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/backups", { method: "POST" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "No fue posible crear la copia.");
      setNotice("Copia cifrada creada correctamente. Incluye datos y archivos.");
      toast.success("Copia cifrada creada correctamente.");
      await load();
    } catch (reason) { const message = reason instanceof Error ? reason.message : "No fue posible crear la copia."; setError(message); toast.error(message); }
    finally { setWorking(false); }
  }

  async function restoreBackup(backup: Backup) {
    const confirmed = window.confirm(`¿Restaurar la copia del ${formatDate(backup.createdAt)}? Los registros coincidentes volverán a ese estado; los registros nuevos no se eliminarán.`);
    if (!confirmed) return;
    setWorking(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/backups/${backup.id}/restore`, { method: "POST" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "No fue posible restaurar la copia.");
      setNotice(`Restauración completada: ${payload.restored.resources} recursos y ${payload.restored.files} archivos verificados.`);
      toast.success("Copia restaurada y archivos verificados.");
      await load();
    } catch (reason) { const message = reason instanceof Error ? reason.message : "No fue posible restaurar la copia."; setError(message); toast.error(message); }
    finally { setWorking(false); }
  }

  return <main className="backup-page"><header className="backup-header"><EcosystemBrand compact /><a href="/admin"><ArrowLeft /> Volver al administrador</a></header><section className="backup-shell"><div className="backup-hero"><div><span className="section-kicker">Continuidad operativa</span><h1>Copias de seguridad</h1><p>Crea una copia cifrada de instituciones, contraseñas protegidas, metadatos, historial y archivos clínicos. Solo tu cuenta administrativa puede crearla o restaurarla.</p></div><Button onClick={createBackup} disabled={working}>{working ? <Loader2 className="spin" /> : <DatabaseBackup />}{working ? "Procesando…" : "Crear copia ahora"}</Button></div>{error && <div className="admin-alert" role="alert">{error}<button onClick={() => setError("")}>Cerrar</button></div>}{notice && <div className="backup-notice" role="status" aria-live="polite"><CheckCircle2 /> {notice}</div>}<div className="backup-guarantees"><article><ShieldCheck /><div><strong>Cifrado AES-GCM</strong><span>Contraseñas y datos sensibles nunca se almacenan en texto visible.</span></div></article><article><HardDrive /><div><strong>Datos + archivos</strong><span>Cada copia conserva también los documentos almacenados.</span></div></article><article><RotateCcw /><div><strong>Restauración sin borrado masivo</strong><span>Recupera registros coincidentes y conserva los creados posteriormente.</span></div></article></div><section className="backup-list-card"><div><h2>Historial de copias</h2><p>Genera una copia después de cada carga o actualización importante.</p></div>{loading ? <div className="backup-empty" role="status" aria-live="polite"><Loader2 className="spin" /> Cargando copias…</div> : backups.length ? <div className="backup-list">{backups.map((backup) => <article key={backup.id}><DatabaseBackup /><div><strong>{formatDate(backup.createdAt)}</strong><span>{backup.institutionCount} instituciones · {backup.resourceCount} recursos · {backup.fileCount} archivos</span><small>Creada por {backup.createdBy}</small></div><Badge variant={backup.status === "restored" ? "secondary" : "default"}>{backup.status === "restored" ? "Restaurada" : "Disponible"}</Badge><Button variant="outline" size="sm" disabled={working} onClick={() => restoreBackup(backup)}><RotateCcw /> Restaurar</Button></article>)}</div> : <div className="backup-empty"><DatabaseBackup /><strong>Aún no existen copias</strong><span>Crea la primera antes de cargar información institucional.</span></div>}</section></section></main>;
}

function formatDate(value: number) { return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }

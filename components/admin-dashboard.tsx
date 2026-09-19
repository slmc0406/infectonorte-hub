"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Activity, Building2, Copy, DatabaseBackup, Download, ExternalLink, FilePlus2, FileText, History, KeyRound, Loader2, LogOut, Pencil, Plus, QrCode, RotateCcw, Search, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";
import { EcosystemBrand } from "./brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type Institution = { id: string; name: string; city: string; slug: string; status: string; resources: number };
type Resource = { id: string; title: string; description: string; type: string; category: string; status: string; visibility: string; institutionId: string | null; institutionName: string | null; version: number; fileName: string; fileSize: number; updatedAt: number };
type ResourceVersion = { id: string; version: number; fileName: string; mimeType: string; fileSize: number; createdBy: string; createdAt: number };
type Overview = { user: { name: string; email: string }; institutions: Institution[]; resources: Resource[]; audit: Array<{ action: string; detail: string; createdAt: number }> };

export function AdminDashboard({ displayName, signOutPath }: { displayName: string; signOutPath: string }) {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [institutionOpen, setInstitutionOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);
  const [editInstitution, setEditInstitution] = useState<Institution | null>(null);
  const [editResource, setEditResourceState] = useState<Resource | null>(null);
  const [qrInstitution, setQrInstitution] = useState<Institution | null>(null);
  const [qrData, setQrData] = useState("");
  const [institutionQuery, setInstitutionQuery] = useState("");
  const [resourceQuery, setResourceQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [resourceVersions, setResourceVersions] = useState<ResourceVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<"overview" | "institutions" | "content">("overview");

  function setEditResource(resource: Resource | null) {
    if (resource) {
      setResourceVersions([]);
      setVersionsLoading(true);
    }
    setEditResourceState(resource);
  }

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/overview", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "No fue posible cargar el panel.");
    setData(payload);
  }, []);

  useEffect(() => {
    if (!editResource) return;
    let active = true;
    fetch(`/api/admin/resources/${editResource.id}/versions`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "No fue posible cargar el historial.");
        return payload.versions as ResourceVersion[];
      })
      .then((versions) => { if (active) setResourceVersions(versions); })
      .catch((reason) => { if (active) setError(reason.message); })
      .finally(() => { if (active) setVersionsLoading(false); });
    return () => { active = false; };
  }, [editResource]);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/overview", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "No fue posible cargar el panel.");
        return payload;
      })
      .then((payload) => { if (active) setData(payload); })
      .catch((reason) => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, []);

  async function submitRequest(request: Promise<Response>, close: () => void, successMessage: string, form?: HTMLFormElement) {
    setSaving(true); setError("");
    try {
      const response = await request;
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "No fue posible guardar los cambios.");
      close(); form?.reset(); await load(); toast.success(successMessage);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "No fue posible guardar los cambios.";
      setError(message); toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function createInstitution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const body = JSON.stringify(Object.fromEntries(new FormData(form)));
    await submitRequest(fetch("/api/admin/institutions", { method: "POST", headers: { "content-type": "application/json" }, body }), () => setInstitutionOpen(false), "Institución creada correctamente.", form);
  }

  async function updateInstitution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editInstitution) return; const body = JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)));
    await submitRequest(fetch(`/api/admin/institutions/${editInstitution.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body }), () => setEditInstitution(null), "Institución actualizada correctamente.");
  }

  async function createResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget;
    await submitRequest(fetch("/api/admin/resources", { method: "POST", body: new FormData(form) }), () => setResourceOpen(false), "Contenido guardado correctamente.", form);
  }

  async function updateResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editResource) return; const body = JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)));
    await submitRequest(fetch(`/api/admin/resources/${editResource.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body }), () => setEditResource(null), "Contenido actualizado correctamente.");
  }

  async function replaceResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editResource) return; const form = event.currentTarget;
    await submitRequest(fetch(`/api/admin/resources/${editResource.id}`, { method: "POST", body: new FormData(form) }), () => setEditResource(null), "Nueva versión subida correctamente.", form);
  }

  async function restoreVersion(version: ResourceVersion) {
    if (!editResource || !window.confirm(`¿Restaurar la versión ${version.version}? Se publicará como una versión nueva y no se perderá el archivo actual.`)) return;
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/admin/resources/${editResource.id}/versions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ version: version.version }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "No fue posible restaurar la versión.");
      setEditResource(null);
      await load();
      toast.success(`Versión ${version.version} restaurada como una versión nueva.`);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "No fue posible restaurar la versión.";
      setError(message); toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function showQr(institution: Institution) {
    const url = `${window.location.origin}/i/${institution.slug}`;
    setQrInstitution(institution);
    setQrData(await QRCode.toDataURL(url, { width: 520, margin: 2, color: { dark: "#20234B", light: "#FFFFFFFF" } }));
  }

  async function copyInstitutionLink() {
    if (!qrInstitution) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/i/${qrInstitution.slug}`);
      toast.success("Enlace institucional copiado.");
    } catch {
      toast.error("No fue posible copiar el enlace. Puedes seleccionarlo manualmente.");
    }
  }

  function navigateTo(section: "overview" | "institutions" | "content") {
    setActiveSection(section);
    requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  const firstName = displayName.split(" ")[0] || "Sebastián";
  const institutions = data?.institutions || [];
  const resources = data?.resources || [];
  const visibleInstitutions = institutions.filter((item) => `${item.name} ${item.city} ${item.slug}`.toLowerCase().includes(institutionQuery.toLowerCase()));
  const visibleResources = resources.filter((item) => `${item.title} ${item.type} ${item.category} ${item.institutionName || ""}`.toLowerCase().includes(resourceQuery.toLowerCase()));

  return <main className="admin-shell"><aside className="admin-sidebar"><div className="admin-branding"><EcosystemBrand compact /><span>Centro de gestión</span></div><nav aria-label="Secciones de administración"><button type="button" className={activeSection === "overview" ? "active" : ""} aria-current={activeSection === "overview" ? "page" : undefined} onClick={() => navigateTo("overview")}><Activity /> Resumen</button><button type="button" className={activeSection === "institutions" ? "active" : ""} aria-current={activeSection === "institutions" ? "page" : undefined} onClick={() => navigateTo("institutions")}><Building2 /> Instituciones</button><button type="button" className={activeSection === "content" ? "active" : ""} aria-current={activeSection === "content" ? "page" : undefined} onClick={() => navigateTo("content")}><FileText /> Contenido</button><a href="/admin/backups"><DatabaseBackup /> Copias de seguridad</a></nav><div className="admin-profile"><span>{firstName.slice(0, 2).toUpperCase()}</span><div><strong>{firstName}</strong><small>Administrador</small></div><a href={signOutPath} title="Cerrar sesión" aria-label="Cerrar sesión"><LogOut /></a></div></aside><div className="admin-main"><header><div className="admin-page-title"><span className="section-kicker">Infectonorte HUB · Administración</span><h1>Hola, {firstName}.</h1><p className="admin-subtitle">Gestiona instituciones, accesos y conocimiento clínico desde un solo lugar.</p></div><div className="admin-actions"><Button variant="outline" onClick={() => setResourceOpen(true)}><FilePlus2 /> Subir contenido</Button><Button onClick={() => setInstitutionOpen(true)}><Plus /> Nueva institución</Button></div></header>{error && <div className="admin-alert" role="alert">{error}<button onClick={() => setError("")}>Cerrar</button></div>}{!data ? <div className="admin-loading" role="status" aria-live="polite"><Loader2 className="spin" /> Cargando información…</div> : <><section className="admin-metrics" id="overview"><article><Building2 /><div><span>Instituciones activas</span><strong>{institutions.filter((item) => item.status === "active").length}</strong><small>Portales habilitados</small></div></article><article><FileText /><div><span>Recursos publicados</span><strong>{resources.filter((item) => item.status === "published").length}</strong><small>Disponibles según visibilidad</small></div></article><article><ShieldCheck /><div><span>Acceso administrativo</span><strong>Protegido</strong><small>Solo usuarios autorizados</small></div></article><article><Activity /><div><span>Actividad reciente</span><strong>{data.audit.length}</strong><small>Acciones registradas</small></div></article></section><Tabs value={activeSection === "content" ? "content" : "institutions"} onValueChange={(value) => setActiveSection(value as "institutions" | "content")} className="admin-tabs"><TabsList variant="line"><TabsTrigger value="institutions">Instituciones</TabsTrigger><TabsTrigger value="content">Contenido</TabsTrigger></TabsList><TabsContent value="institutions"><section className="admin-card" id="institutions"><div className="admin-card-heading"><div><h2>Instituciones</h2><p>Administra portales, contraseñas, estado y códigos QR.</p></div><div className="mini-search"><Search /><Input aria-label="Buscar institución" placeholder="Buscar institución…" value={institutionQuery} onChange={(event) => setInstitutionQuery(event.target.value)} /></div></div>{visibleInstitutions.length ? <div className="admin-table"><div className="table-head"><span>Institución</span><span>Estado</span><span>Contenido</span><span>Portal y QR</span><span /></div>{visibleInstitutions.map((institution) => <div className="table-row" key={institution.id}><div className="institution-cell"><span>{institution.name.slice(0, 2).toUpperCase()}</span><div><strong>{institution.name}</strong><small>{institution.city} · /i/{institution.slug}</small></div></div><div><Badge variant={institution.status === "active" ? "default" : "secondary"}>{institutionStatus(institution.status)}</Badge></div><span>{Number(institution.resources)} recursos</span><div className="qr-actions"><Button size="sm" variant="outline" onClick={() => showQr(institution)}><QrCode /> Ver QR</Button><Button size="icon" variant="ghost" asChild><a href={`/i/${institution.slug}`} target="_blank" rel="noreferrer" aria-label={`Abrir portal de ${institution.name}`}><ExternalLink /></a></Button></div><Button size="icon" variant="ghost" onClick={() => setEditInstitution(institution)} aria-label={`Editar ${institution.name}`}><Pencil /></Button></div>)}</div> : <div className="empty-admin"><Building2 /><h2>{institutions.length ? "No hay coincidencias" : "Crea la primera institución"}</h2><p>{institutions.length ? "Prueba con otro nombre o ciudad." : "El portal y su QR se generan automáticamente."}</p><Button onClick={() => setInstitutionOpen(true)}><Plus /> Nueva institución</Button></div>}</section></TabsContent><TabsContent value="content"><section className="admin-card" id="content"><div className="admin-card-heading"><div><h2>Contenido</h2><p>Gestiona publicación, visibilidad, archivo y nuevas versiones.</p></div><div className="admin-card-tools"><div className="mini-search"><Search /><Input aria-label="Buscar contenido" placeholder="Buscar contenido…" value={resourceQuery} onChange={(event) => setResourceQuery(event.target.value)} /></div><Button onClick={() => setResourceOpen(true)}><FilePlus2 /> Subir</Button></div></div>{visibleResources.length ? <div className="content-admin-list">{visibleResources.map((resource) => <div key={resource.id}><FileText /><span><strong>{resource.title}</strong><small>{resource.type} · {resource.category} · v{resource.version} · {formatBytes(resource.fileSize)}</small></span><Badge variant={resource.status === "published" ? "default" : "secondary"}>{resourceStatus(resource.status)}</Badge><Badge variant="secondary">{resource.visibility === "general" ? "General" : resource.institutionName}</Badge>{resource.status === "published" && <Button size="sm" variant="ghost" asChild><a href={`/api/resources/${resource.id}`} target="_blank" rel="noreferrer">Abrir <ExternalLink /></a></Button>}<Button size="icon" variant="ghost" onClick={() => setEditResource(resource)} aria-label={`Editar ${resource.title}`}><Pencil /></Button></div>)}</div> : <div className="empty-admin"><FileText /><h2>{resources.length ? "No hay coincidencias" : "Aún no hay contenido"}</h2><p>{resources.length ? "Prueba con otro término." : "Sube el primer PDF, imagen o presentación."}</p><Button onClick={() => setResourceOpen(true)}><FilePlus2 /> Subir contenido</Button></div>}</section></TabsContent></Tabs></>}</div>

  <Dialog open={institutionOpen} onOpenChange={setInstitutionOpen}><DialogContent><form onSubmit={createInstitution}><DialogHeader><DialogTitle>Nueva institución</DialogTitle><DialogDescription>Crea el portal protegido y su código QR.</DialogDescription></DialogHeader><InstitutionFields idPrefix="institution-create" /><DialogFooter><Button type="button" variant="outline" onClick={() => setInstitutionOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Creando…" : "Crear institución"}</Button></DialogFooter></form></DialogContent></Dialog>

  <Dialog open={Boolean(editInstitution)} onOpenChange={(open) => !open && setEditInstitution(null)}><DialogContent>{editInstitution && <form key={editInstitution.id} onSubmit={updateInstitution}><DialogHeader><DialogTitle>Editar institución</DialogTitle><DialogDescription>Actualiza el portal, su estado o genera una nueva contraseña.</DialogDescription></DialogHeader><InstitutionFields institution={editInstitution} idPrefix="institution-edit" /><DialogFooter><Button type="button" variant="outline" onClick={() => setEditInstitution(null)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</Button></DialogFooter></form>}</DialogContent></Dialog>

  <Dialog open={resourceOpen} onOpenChange={setResourceOpen}><DialogContent><form onSubmit={createResource}><DialogHeader><DialogTitle>Subir contenido</DialogTitle><DialogDescription>Define si se publica ahora o permanece como borrador.</DialogDescription></DialogHeader><ResourceFields institutions={institutions} includeFile idPrefix="resource-create" /><DialogFooter><Button type="button" variant="outline" onClick={() => setResourceOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Subiendo…" : "Guardar contenido"}</Button></DialogFooter></form></DialogContent></Dialog>

  <Dialog open={Boolean(editResource)} onOpenChange={(open) => !open && setEditResource(null)}><DialogContent>{editResource && <div key={editResource.id}><form onSubmit={updateResource}><DialogHeader><DialogTitle>Editar contenido</DialogTitle><DialogDescription>Cambia sus datos, visibilidad o estado editorial.</DialogDescription></DialogHeader><ResourceFields institutions={institutions} resource={editResource} idPrefix="resource-edit" /><DialogFooter><Button type="button" variant="outline" onClick={() => setEditResource(null)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</Button></DialogFooter></form><form className="replace-file" onSubmit={replaceResource}><div><strong><Upload /> Reemplazar archivo</strong><small>Creará automáticamente la versión {editResource.version + 1}.</small></div><Input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.pptx" aria-label="Archivo de la nueva versión" required /><Button type="submit" variant="outline" disabled={saving}>Subir nueva versión</Button></form><section className="version-history" aria-labelledby="version-history-title"><div><strong id="version-history-title"><History /> Historial de versiones</strong><small>Los archivos anteriores se conservan y pueden recuperarse.</small></div>{versionsLoading ? <span className="version-loading" role="status" aria-live="polite"><Loader2 className="spin" /> Cargando…</span> : <div className="version-list">{resourceVersions.map((version) => <div key={version.id}><span><strong>v{version.version} · {version.fileName}</strong><small>{formatBytes(version.fileSize)} · {formatDate(version.createdAt)}</small></span>{version.version === editResource.version ? <Badge>Actual</Badge> : <Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => restoreVersion(version)}><RotateCcw /> Restaurar</Button>}</div>)}</div>}</section></div>}</DialogContent></Dialog>

  <Dialog open={Boolean(qrInstitution)} onOpenChange={(open) => !open && setQrInstitution(null)}><DialogContent><DialogHeader><DialogTitle>QR de {qrInstitution?.name}</DialogTitle><DialogDescription>Este QR abre el portal institucional. La contraseña nunca va incluida.</DialogDescription></DialogHeader><div className="qr-preview">{qrData && <Image src={qrData} width={280} height={280} unoptimized alt={`Código QR de ${qrInstitution?.name}`} />}<code>{qrInstitution && `${typeof window !== "undefined" ? window.location.origin : ""}/i/${qrInstitution.slug}`}</code></div><DialogFooter><Button variant="outline" onClick={copyInstitutionLink}><Copy /> Copiar enlace</Button><Button asChild><a href={qrData} download={`QR-${qrInstitution?.slug}.png`}><Download /> Descargar QR</a></Button></DialogFooter></DialogContent></Dialog>
  </main>;
}

function InstitutionFields({ institution, idPrefix }: { institution?: Institution; idPrefix: string }) {
  const id = (name: string) => `${idPrefix}-${name}`;
  return <div className="dialog-form"><Label htmlFor={id("name")}>Nombre</Label><Input id={id("name")} name="name" defaultValue={institution?.name} placeholder="Ej. Clínica San José" required /><Label htmlFor={id("city")}>Ciudad</Label><Input id={id("city")} name="city" defaultValue={institution?.city || "Cúcuta"} /><Label htmlFor={id("slug")}>URL corta</Label><Input id={id("slug")} name="slug" defaultValue={institution?.slug} placeholder="clinica-san-jose" /><Label htmlFor={id("status")}>Estado</Label><select id={id("status")} name="status" defaultValue={institution?.status || "active"}><option value="active">Activa</option><option value="draft">En preparación</option><option value="archived">Archivada</option></select><Label htmlFor={id("password")}><KeyRound /> {institution ? "Nueva contraseña (opcional)" : "Contraseña institucional"}</Label><Input id={id("password")} name="password" type="password" minLength={8} autoComplete="new-password" required={!institution} /><small>{institution ? "Déjala vacía para conservar la contraseña actual." : "Mínimo 8 caracteres."}</small></div>;
}

function ResourceFields({ institutions, resource, includeFile = false, idPrefix }: { institutions: Institution[]; resource?: Resource; includeFile?: boolean; idPrefix: string }) {
  const id = (name: string) => `${idPrefix}-${name}`;
  return <div className="dialog-form"><Label htmlFor={id("title")}>Título</Label><Input id={id("title")} name="title" defaultValue={resource?.title} required /><Label htmlFor={id("description")}>Descripción</Label><Textarea id={id("description")} name="description" defaultValue={resource?.description} rows={3} /><div className="form-grid"><div><Label htmlFor={id("type")}>Tipo</Label><select id={id("type")} name="type" defaultValue={resource?.type || "Documento"}><option>Documento</option><option>Protocolo</option><option>Infografía</option><option>Presentación</option><option>Gráfica</option></select></div><div><Label htmlFor={id("category")}>Categoría</Label><Input id={id("category")} name="category" defaultValue={resource?.category || "General"} /></div></div><div className="form-grid"><div><Label htmlFor={id("status")}>Estado</Label><select id={id("status")} name="status" defaultValue={resource?.status || "published"}><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select></div><div><Label htmlFor={id("visibility")}>Visibilidad</Label><select id={id("visibility")} name="visibility" defaultValue={resource?.visibility || "general"}><option value="general">Biblioteca general</option><option value="institution">Solo una institución</option></select></div></div><Label htmlFor={id("institutionId")}>Institución (si aplica)</Label><select id={id("institutionId")} name="institutionId" defaultValue={resource?.institutionId || ""}><option value="">Seleccionar…</option>{institutions.filter((item) => item.status !== "archived").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{includeFile && <><Label htmlFor={id("file")}>Archivo</Label><Input id={id("file")} name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.pptx" required /><small>PDF, imagen o PPTX · máximo 25 MB</small></>}</div>;
}

function formatBytes(value: number) { return value < 1024 * 1024 ? `${Math.max(1, Math.round(value / 1024))} KB` : `${(value / (1024 * 1024)).toFixed(1)} MB`; }
function formatDate(value: number) { return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function institutionStatus(value: string) { return value === "active" ? "Activa" : value === "draft" ? "En preparación" : "Archivada"; }
function resourceStatus(value: string) { return value === "published" ? "Publicado" : value === "draft" ? "Borrador" : "Archivado"; }

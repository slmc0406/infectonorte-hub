"use client";
import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InstitutionLogin({ institution }: { institution: { name: string; city: string; slug: string } }) {
  const [password, setPassword] = useState(""); const [visible, setVisible] = useState(false); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/institution-login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug: institution.slug, password }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "La contraseña no coincide. Intenta de nuevo.");
      window.location.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible verificar el acceso. Intenta nuevamente.");
      setLoading(false);
    }
  }
  const initials = institution.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return <div className="institution-login-page"><div className="login-panel"><Brand /><div className="institution-lockup"><div className="demo-institution-logo">{initials}</div><div><span>Infectonorte HUB ×</span><strong>{institution.name}</strong><small>{institution.city}</small></div></div><div className="login-copy"><span className="section-kicker">Portal clínico institucional</span><h1>Conocimiento local,<br />siempre disponible.</h1><p>Ingresa con la contraseña asignada a tu institución.</p></div><form onSubmit={submit}><label htmlFor="password">Contraseña institucional</label><div className="password-field"><LockKeyhole size={18} aria-hidden="true" /><Input id="password" type={visible ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Ingresa la contraseña" autoComplete="current-password" aria-describedby={error ? "institution-login-error" : undefined} aria-invalid={Boolean(error)} required /><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{error && <p className="form-error" id="institution-login-error" role="alert">{error}</p>}<Button type="submit" size="lg" disabled={loading} aria-busy={loading}>{loading ? "Verificando…" : <>Ingresar <ArrowRight /></>}</Button></form><p className="login-help">¿Necesitas ayuda? Contacta al equipo de Infectonorte.</p></div><div className="login-art"><div className="mesh" /><div className="art-copy"><span>Acceso rápido desde cualquier punto de atención.</span><h2>Escanea. Busca.<br />Consulta.</h2><p>El QR identifica tu institución, pero nunca contiene su contraseña.</p></div><div className="qr-mock" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></div></div>;
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Copy, Check, Power } from 'lucide-react';
import { Institution } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export function InstitutionEditPanel({ institution, siteUrl }: { institution: Institution; siteUrl: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [togglingStatus, setTogglingStatus] = useState(false);

  const portalUrl = `${siteUrl}/i/${institution.slug}`;

  async function copyUrl() {
    await navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function toggleStatus() {
    setTogglingStatus(true);
    await fetch(`/api/admin/institutions/${institution.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: institution.status === 'activa' ? 'inactiva' : 'activa' }),
    });
    router.refresh();
    setTogglingStatus(false);
  }

  async function changePassword() {
    setPasswordMsg('');
    if (newPassword.length < 6) {
      setPasswordMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    const res = await fetch(`/api/admin/institutions/${institution.id}/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });
    if (res.ok) {
      setPasswordMsg('Contraseña actualizada. El QR sigue siendo el mismo.');
      setNewPassword('');
    } else {
      setPasswordMsg('No pudimos actualizar la contraseña.');
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h2 className="font-semibold text-ink">Estado y acceso</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Estado actual: <span className="font-medium text-ink">{institution.status === 'activa' ? 'Activa' : 'Inactiva'}</span>
        </p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={toggleStatus} disabled={togglingStatus}>
          <Power size={14} /> {institution.status === 'activa' ? 'Desactivar' : 'Activar'} institución
        </Button>

        <div className="mt-6 border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-ink">Cambiar contraseña institucional</h3>
          <p className="mt-1 text-xs text-ink-faint">Cambiar la contraseña no afecta el QR: sigue apuntando a la misma URL.</p>
          <div className="mt-3 flex gap-2">
            <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nueva contraseña" />
            <Button size="md" onClick={changePassword}>Guardar</Button>
          </div>
          {passwordMsg && <p className="mt-2 text-xs text-ink-soft">{passwordMsg}</p>}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-ink">Código QR</h2>
        <p className="mt-1 text-sm text-ink-soft">Apunta permanentemente a {portalUrl}</p>
        <div className="mt-4 flex items-center justify-center rounded-lg border border-border bg-surface-sunken p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/admin/institutions/${institution.id}/qr?format=png&preview=1`} alt={`QR de ${institution.name}`} width={180} height={180} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" href={`/api/admin/institutions/${institution.id}/qr?format=png`}>
            <Download size={14} /> PNG
          </Button>
          <Button variant="secondary" size="sm" href={`/api/admin/institutions/${institution.id}/qr?format=svg`}>
            <Download size={14} /> SVG
          </Button>
          <Button variant="secondary" size="sm" onClick={copyUrl}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiada' : 'Copiar URL'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

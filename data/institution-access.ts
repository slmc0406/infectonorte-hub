// Tabla `institution_access` (demo). Separada de `institutions` a propósito:
// es el punto de evolución hacia magic link / cuentas individuales / SSO.
// Contraseña en texto plano para pruebas del MVP: demo1234 (ver docs).
export interface InstitutionAccessRecord {
  institutionId: string;
  method: 'shared_password' | 'magic_link' | 'email_password';
  passwordHash: string;
  updatedAt: string;
}

export const institutionAccess: InstitutionAccessRecord[] = [
  {
    institutionId: 'inst-demo-norte',
    method: 'shared_password',
    passwordHash: '$2a$10$rWMfyVreOnacWq7zutRIruQDJ.p9cg/UXlbTNabXsItTeuuh0dwnO', // demo1234
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
];

export function getAccessByInstitutionId(institutionId: string) {
  return institutionAccess.find((a) => a.institutionId === institutionId) ?? null;
}

// El hash ya debe venir calculado (bcrypt) — nunca se persiste texto plano.
export function setPasswordHash(institutionId: string, passwordHash: string) {
  const existing = getAccessByInstitutionId(institutionId);
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.updatedAt = new Date().toISOString();
    return existing;
  }
  const record: InstitutionAccessRecord = {
    institutionId,
    method: 'shared_password',
    passwordHash,
    updatedAt: new Date().toISOString(),
  };
  institutionAccess.push(record);
  return record;
}

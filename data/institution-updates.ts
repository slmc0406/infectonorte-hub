import { InstitutionUpdate } from '@/lib/types';

export const institutionUpdates: Record<string, InstitutionUpdate[]> = {
  'inst-demo-norte': [
    { id: 'upd-1', label: 'NUEVO', title: 'Antibiograma institucional 2026', resourceId: 'res-13', createdAt: '2026-08-10T00:00:00.000Z' },
    { id: 'upd-2', label: 'ACTUALIZADO', title: 'Algoritmo de infección urinaria', resourceId: 'res-14', createdAt: '2026-08-20T00:00:00.000Z' },
    { id: 'upd-3', label: 'NUEVO', title: 'Presentación: Uso racional de antimicrobianos en UCI', resourceId: 'res-9', createdAt: '2026-06-10T00:00:00.000Z' },
  ],
};

export function getUpdatesForInstitution(institutionId: string): InstitutionUpdate[] {
  return institutionUpdates[institutionId] ?? [];
}

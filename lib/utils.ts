import clsx, { ClassValue } from 'clsx';
import { ResourceStatus, ResourceType } from './types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso));
}

export const statusMeta: Record<ResourceStatus, { label: string; dot: string; text: string; bg: string }> = {
  vigente: { label: 'Vigente', dot: 'bg-state-vigente', text: 'text-state-vigente', bg: 'bg-state-vigente/10' },
  proximo_revision: { label: 'Próximo a revisión', dot: 'bg-state-revision', text: 'text-state-revision', bg: 'bg-state-revision/10' },
  en_revision: { label: 'En revisión', dot: 'bg-state-revision', text: 'text-state-revision', bg: 'bg-state-revision/10' },
  vencido: { label: 'Vencido', dot: 'bg-state-vencido', text: 'text-state-vencido', bg: 'bg-state-vencido/10' },
  archivado: { label: 'Archivado', dot: 'bg-state-archivado', text: 'text-state-archivado', bg: 'bg-state-archivado/10' },
  borrador: { label: 'Borrador', dot: 'bg-state-borrador', text: 'text-state-borrador', bg: 'bg-state-borrador/10' },
};

export const typeLabels: Record<ResourceType, string> = {
  algoritmo: 'Algoritmo',
  protocolo: 'Protocolo',
  guia: 'Guía',
  infografia: 'Infografía',
  presentacion: 'Presentación',
  grafica: 'Gráfica',
  dashboard: 'Dashboard',
  video: 'Video',
  pdf: 'PDF',
  documento: 'Documento',
  enlace: 'Enlace',
  herramienta: 'Herramienta',
};

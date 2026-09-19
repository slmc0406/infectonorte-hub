import {
  GitBranch,
  ShieldCheck,
  SprayCan,
  Syringe,
  Baby,
  Microscope,
  LineChart,
  GraduationCap,
  Image as ImageIcon,
  FileText,
  BarChart3,
  Gauge,
  Video,
  Link2,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

// Lenguaje iconográfico consistente — nunca emojis (ver docs sección 31).
export const areaIcons: Record<string, LucideIcon> = {
  proa: ShieldCheck,
  pci: SprayCan,
  vacunacion: Syringe,
  pediatria: Baby,
  microbiologia: Microscope,
  epidemiologia: LineChart,
  infectologia: GitBranch,
};

export const typeIcons: Record<string, LucideIcon> = {
  algoritmo: GitBranch,
  protocolo: ShieldCheck,
  guia: FileText,
  infografia: ImageIcon,
  presentacion: GraduationCap,
  grafica: BarChart3,
  dashboard: Gauge,
  video: Video,
  pdf: FileText,
  documento: FileText,
  enlace: Link2,
  herramienta: Wrench,
};

export function getTypeIcon(type: string): LucideIcon {
  return typeIcons[type] ?? FileText;
}

export function getAreaIcon(area: string): LucideIcon {
  return areaIcons[area] ?? GitBranch;
}

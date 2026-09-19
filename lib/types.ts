// Tipos que reflejan el modelo de datos descrito en docs/00-estrategia-arquitectura.md
// Esta capa es intencionalmente idéntica a como se verían las filas de Postgres/Supabase,
// para que sustituir data/*.ts por consultas reales a Supabase no requiera tocar la UI.

export type ResourceType =
  | 'algoritmo'
  | 'protocolo'
  | 'guia'
  | 'infografia'
  | 'presentacion'
  | 'grafica'
  | 'dashboard'
  | 'video'
  | 'pdf'
  | 'documento'
  | 'enlace'
  | 'herramienta';

export type ResourceStatus =
  | 'vigente'
  | 'proximo_revision'
  | 'en_revision'
  | 'vencido'
  | 'archivado'
  | 'borrador';

export type Visibility =
  | 'publico'
  | 'general_infectonorte'
  | 'instituciones_seleccionadas'
  | 'exclusivo';

export type Taxonomy = 'tipo' | 'area' | 'sindrome' | 'poblacion';

export interface TaxonomyTerm {
  id: string;
  taxonomy: Taxonomy;
  label: string;
  slug: string;
}

export interface Tag {
  id: string;
  label: string;
  slug: string;
}

export interface Author {
  id: string;
  name: string;
  credentials?: string;
}

export interface ResourceVersion {
  id: string;
  resourceId: string;
  versionLabel: string;
  fileUrl: string;
  changelog: string;
  createdAt: string;
  createdBy: string;
}

export interface PresentationDetails {
  speaker: string;
  event: string;
  sessionDate: string;
  videoUrl?: string;
}

export interface Resource {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  keyPoints: string[];
  type: ResourceType;
  typePath: string; // segmento de URL, ej. "algoritmos"
  status: ResourceStatus;
  visibility: Visibility;
  ownerInstitutionId?: string;
  parentResourceId?: string;
  areas: string[]; // slugs de taxonomy_terms (area)
  populations: string[]; // slugs (poblacion)
  syndromes: string[]; // slugs (sindrome)
  tags: string[]; // slugs de tags (microorganismos, antimicrobianos, libres)
  authors: { author: Author; role: 'autor' | 'revisor' }[];
  institutionName?: string;
  references: string[];
  relatedResourceIds: string[];
  version: string;
  createdAt: string;
  publishedAt: string;
  lastReviewedAt: string;
  nextReviewAt: string;
  coverImage?: string;
  fileUrl?: string;
  isDemo: boolean;
  presentation?: PresentationDetails;
  views: number;
  downloads: number;
}

export interface InstitutionUpdate {
  id: string;
  label: 'NUEVO' | 'ACTUALIZADO';
  title: string;
  resourceId?: string;
  createdAt: string;
}

export interface Institution {
  id: string;
  slug: string;
  name: string;
  city: string;
  department: string;
  logoUrl?: string;
  status: 'activa' | 'inactiva';
  contactEmail?: string;
  contactPhone?: string;
  services: string[]; // servicios Infectonorte habilitados (PROA, PCI, etc.)
  isDemo: boolean;
  createdAt: string;
}

export interface ContentRequest {
  id: string;
  topic: string;
  description: string;
  institutionId?: string;
  requesterContact?: string;
  status: 'nueva' | 'agrupada' | 'en_desarrollo' | 'publicada' | 'descartada';
  count: number;
  createdAt: string;
}

export interface AnalyticsSummary {
  topResources: { resource: Resource; count: number }[];
  topInstitutions: { institution: Institution; count: number }[];
  topSearches: { query: string; count: number }[];
  noResultSearches: { query: string; count: number }[];
}

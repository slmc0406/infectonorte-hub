import { TaxonomyTerm, Tag } from '@/lib/types';

export const taxonomyTerms: TaxonomyTerm[] = [
  // Áreas / especialidades
  { id: 'area-proa', taxonomy: 'area', label: 'PROA', slug: 'proa' },
  { id: 'area-pci', taxonomy: 'area', label: 'PCI', slug: 'pci' },
  { id: 'area-vacunacion', taxonomy: 'area', label: 'Vacunación', slug: 'vacunacion' },
  { id: 'area-pediatria', taxonomy: 'area', label: 'Pediatría', slug: 'pediatria' },
  { id: 'area-microbiologia', taxonomy: 'area', label: 'Microbiología', slug: 'microbiologia' },
  { id: 'area-epidemiologia', taxonomy: 'area', label: 'Epidemiología', slug: 'epidemiologia' },
  { id: 'area-infectologia', taxonomy: 'area', label: 'Infectología general', slug: 'infectologia' },

  // Población
  { id: 'pop-adultos', taxonomy: 'poblacion', label: 'Adultos', slug: 'adultos' },
  { id: 'pop-pediatria', taxonomy: 'poblacion', label: 'Pediatría', slug: 'pediatria-pob' },
  { id: 'pop-neonatos', taxonomy: 'poblacion', label: 'Neonatos', slug: 'neonatos' },
  { id: 'pop-embarazo', taxonomy: 'poblacion', label: 'Embarazo', slug: 'embarazo' },

  // Síndrome
  { id: 'sind-respiratorio', taxonomy: 'sindrome', label: 'Respiratorio', slug: 'respiratorio' },
  { id: 'sind-urinario', taxonomy: 'sindrome', label: 'Urinario', slug: 'urinario' },
  { id: 'sind-snc', taxonomy: 'sindrome', label: 'SNC', slug: 'snc' },
  { id: 'sind-bacteriemia', taxonomy: 'sindrome', label: 'Bacteriemia', slug: 'bacteriemia' },
  { id: 'sind-piel', taxonomy: 'sindrome', label: 'Piel y tejidos blandos', slug: 'piel-tejidos-blandos' },
  { id: 'sind-intraabdominal', taxonomy: 'sindrome', label: 'Intraabdominal', slug: 'intraabdominal' },
  { id: 'sind-osteoarticular', taxonomy: 'sindrome', label: 'Osteoarticular', slug: 'osteoarticular' },

  // Tipo (también sirve de segmento de URL vía resource.typePath)
  { id: 'tipo-algoritmo', taxonomy: 'tipo', label: 'Algoritmo', slug: 'algoritmos' },
  { id: 'tipo-protocolo', taxonomy: 'tipo', label: 'Protocolo', slug: 'protocolos' },
  { id: 'tipo-guia', taxonomy: 'tipo', label: 'Guía', slug: 'guias' },
  { id: 'tipo-infografia', taxonomy: 'tipo', label: 'Infografía', slug: 'infografias' },
  { id: 'tipo-presentacion', taxonomy: 'tipo', label: 'Presentación', slug: 'academia' },
  { id: 'tipo-grafica', taxonomy: 'tipo', label: 'Gráfica', slug: 'graficas' },
  { id: 'tipo-dashboard', taxonomy: 'tipo', label: 'Dashboard', slug: 'dashboards' },
  { id: 'tipo-documento', taxonomy: 'tipo', label: 'Documento', slug: 'documentos' },
];

export const tags: Tag[] = [
  { id: 'tag-saureus', label: 'Staphylococcus aureus', slug: 'staphylococcus-aureus' },
  { id: 'tag-ecoli', label: 'Escherichia coli', slug: 'e-coli' },
  { id: 'tag-vancomicina', label: 'Vancomicina', slug: 'vancomicina' },
  { id: 'tag-ceftriaxona', label: 'Ceftriaxona', slug: 'ceftriaxona' },
  { id: 'tag-iaas', label: 'IAAS', slug: 'iaas' },
  { id: 'tag-uci', label: 'UCI', slug: 'uci' },
];

export function termsByTaxonomy(taxonomy: TaxonomyTerm['taxonomy']) {
  return taxonomyTerms.filter((t) => t.taxonomy === taxonomy);
}

export function termLabel(slug: string): string {
  return taxonomyTerms.find((t) => t.slug === slug)?.label ?? slug;
}

export function tagLabel(slug: string): string {
  return tags.find((t) => t.slug === slug)?.label ?? slug;
}

export function typePath(type: string): string {
  return taxonomyTerms.find((t) => t.taxonomy === 'tipo' && t.id === `tipo-${type}`)?.slug ?? type;
}

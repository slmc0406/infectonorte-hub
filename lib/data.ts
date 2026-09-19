import { Activity, BarChart3, BookOpen, FileChartColumn, Microscope, Presentation, ShieldCheck, Syringe } from "lucide-react";

export type Resource = {
  slug: string; title: string; summary: string; type: string; area: string;
  population: string; version: string; updated: string; nextReview: string;
  status: "Vigente" | "Próximo a revisión" | "Nuevo"; private?: boolean; tags: string[];
};

export const categories = [
  { label: "Algoritmos", icon: Activity, count: 5, color: "blue" },
  { label: "PROA", icon: ShieldCheck, count: 8, color: "teal" },
  { label: "PCI", icon: FileChartColumn, count: 6, color: "violet" },
  { label: "Vacunación", icon: Syringe, count: 4, color: "rose" },
  { label: "Pediatría", icon: BookOpen, count: 7, color: "amber" },
  { label: "Microbiología", icon: Microscope, count: 3, color: "cyan" },
  { label: "Epidemiología", icon: BarChart3, count: 5, color: "indigo" },
  { label: "Academia", icon: Presentation, count: 3, color: "emerald" },
];

export const resources: Resource[] = [
  { slug: "bacteriemia-staphylococcus-aureus", title: "Bacteriemia por Staphylococcus aureus", summary: "Ruta estructurada de evaluación, control de foco y seguimiento institucional.", type: "Algoritmo clínico", area: "PROA", population: "Adultos", version: "2.1", updated: "18 ago 2026", nextReview: "18 feb 2027", status: "Vigente", tags: ["Bacteriemia", "S. aureus", "Hemocultivos"] },
  { slug: "infeccion-urinaria-pediatrica", title: "Infección urinaria en pediatría", summary: "Orientación diagnóstica y ruta de atención para población pediátrica.", type: "Algoritmo clínico", area: "Pediatría", population: "Pediatría", version: "1.4", updated: "12 ago 2026", nextReview: "12 feb 2027", status: "Vigente", tags: ["ITU", "Urocultivo", "Pediatría"] },
  { slug: "profilaxis-antimicrobiana-quirurgica", title: "Profilaxis antimicrobiana quirúrgica", summary: "Documento institucional para selección, momento y seguimiento de profilaxis.", type: "Protocolo", area: "PROA", population: "Adultos", version: "3.0", updated: "7 ago 2026", nextReview: "7 nov 2026", status: "Próximo a revisión", tags: ["Profilaxis", "Cirugía", "Antimicrobianos"] },
  { slug: "precauciones-aislamiento", title: "Precauciones y medidas de aislamiento", summary: "Infografía rápida para selección de precauciones según mecanismo de transmisión.", type: "Infografía", area: "PCI", population: "Todas", version: "1.2", updated: "1 ago 2026", nextReview: "1 ago 2027", status: "Vigente", tags: ["Aislamiento", "IAAS", "Precauciones"] },
  { slug: "optimizacion-antimicrobianos-uci", title: "Optimización de antimicrobianos en UCI", summary: "Sesión académica sobre decisiones de optimización y seguimiento en cuidado crítico.", type: "Presentación", area: "Academia", population: "Adultos", version: "1.0", updated: "24 jul 2026", nextReview: "24 jul 2027", status: "Nuevo", tags: ["UCI", "PROA", "Academia"] },
  { slug: "antibiograma-institucional-2026", title: "Antibiograma institucional 2026", summary: "Sensibilidad antimicrobiana estratificada por microorganismo y servicio.", type: "Dashboard", area: "Microbiología", population: "Todas", version: "2026.1", updated: "20 ago 2026", nextReview: "20 feb 2027", status: "Nuevo", private: true, tags: ["Antibiograma", "Sensibilidad", "Institucional"] },
];

export const demoNotice = "CONTENIDO DEMOSTRATIVO — NO UTILIZAR PARA DECISIONES CLÍNICAS";

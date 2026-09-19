import { Institution } from '@/lib/types';

// Institución piloto para el MVP. Todo su contenido "exclusivo" está marcado como DEMO.
// La contraseña institucional en texto plano para pruebas es: demo1234
// (el hash se valida en lib/auth.ts contra data/institution-access.ts)
export const institutions: Institution[] = [
  {
    id: 'inst-demo-norte',
    slug: 'clinica-demo-norte',
    name: 'Clínica Demo del Norte',
    city: 'Barranquilla',
    department: 'Atlántico',
    logoUrl: undefined,
    status: 'activa',
    contactEmail: 'contacto@clinicademonorte.example',
    contactPhone: '+57 300 000 0000',
    services: ['proa', 'pci', 'epidemiologia'],
    isDemo: true,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
];

export function getInstitutionBySlug(slug: string) {
  return institutions.find((i) => i.slug === slug) ?? null;
}

export function getInstitutionById(id: string) {
  return institutions.find((i) => i.id === id) ?? null;
}

// Mutaciones en memoria para el panel administrativo del MVP demo. En
// producción estas funciones se reemplazan por INSERT/UPDATE a Supabase
// (tabla `institutions`); la firma se mantiene igual para minimizar el
// cambio en las rutas de API que las consumen.
export function createInstitution(input: {
  name: string;
  slug: string;
  city: string;
  department: string;
  contactEmail?: string;
  contactPhone?: string;
  services: string[];
}): Institution {
  const institution: Institution = {
    id: `inst-${Date.now()}`,
    slug: input.slug,
    name: input.name,
    city: input.city,
    department: input.department,
    status: 'activa',
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    services: input.services,
    isDemo: false,
    createdAt: new Date().toISOString(),
  };
  institutions.push(institution);
  return institution;
}

export function updateInstitution(id: string, patch: Partial<Omit<Institution, 'id'>>): Institution | null {
  const institution = getInstitutionById(id);
  if (!institution) return null;
  Object.assign(institution, patch);
  return institution;
}

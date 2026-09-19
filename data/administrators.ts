// Tabla `administrators` (demo). Contraseña en texto plano para pruebas: admin1234
export interface Administrator {
  id: string;
  email: string;
  passwordHash: string;
  role: 'superadmin' | 'editor';
  name: string;
}

export const administrators: Administrator[] = [
  {
    id: 'admin-1',
    email: 'admin@infectonorte.com',
    passwordHash: '$2a$10$GitkKWlFskd3eSIJvQHw5.jjDUKxBpqYeXomPPAm.x2iEseQJxjUq', // admin1234
    role: 'superadmin',
    name: 'Equipo Infectonorte',
  },
];

export function getAdministratorByEmail(email: string) {
  return administrators.find((a) => a.email.toLowerCase() === email.toLowerCase()) ?? null;
}

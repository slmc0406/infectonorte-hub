import { ContentRequest } from '@/lib/types';

export const contentRequests: ContentRequest[] = [
  {
    id: 'req-1',
    topic: 'Calculadora de ajuste renal de antimicrobianos',
    description: 'Varias instituciones han pedido una herramienta de ajuste de dosis por función renal.',
    status: 'en_desarrollo',
    count: 7,
    createdAt: '2026-07-01T00:00:00.000Z',
  },
  {
    id: 'req-2',
    topic: 'Protocolo de manejo de neutropenia febril',
    description: 'Solicitado por servicio de oncología.',
    institutionId: 'inst-demo-norte',
    status: 'nueva',
    count: 2,
    createdAt: '2026-08-10T00:00:00.000Z',
  },
  {
    id: 'req-3',
    topic: 'Infografía de aislamiento por gotas/contacto',
    description: 'Solicitada para cartelera de urgencias.',
    status: 'agrupada',
    count: 4,
    createdAt: '2026-06-20T00:00:00.000Z',
  },
];

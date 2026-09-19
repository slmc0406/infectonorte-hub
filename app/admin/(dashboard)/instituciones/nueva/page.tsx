import { Metadata } from 'next';
import { InstitutionCreateForm } from '@/components/institution-create-form';

export const metadata: Metadata = { title: 'Nueva institución · Admin', robots: { index: false, follow: false } };

export default function NewInstitutionPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-ink">Nueva institución</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Al guardar se crea el portal, la URL y el acceso de inmediato; el QR queda disponible para descargar.
      </p>
      <div className="mt-8">
        <InstitutionCreateForm />
      </div>
    </div>
  );
}

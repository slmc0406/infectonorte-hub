import { Metadata } from 'next';
import { ContentCreateForm } from '@/components/content-create-form';

export const metadata: Metadata = { title: 'Nuevo contenido · Admin', robots: { index: false, follow: false } };

export default function NewContentPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">Nuevo contenido</h1>
      <p className="mt-1 text-sm text-ink-soft">Puedes guardar como borrador y publicar más tarde.</p>
      <div className="mt-8">
        <ContentCreateForm />
      </div>
    </div>
  );
}

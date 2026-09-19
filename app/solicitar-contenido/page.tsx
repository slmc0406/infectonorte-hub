import { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ContentRequestForm } from '@/components/content-request-form';

export const metadata: Metadata = { title: 'Solicitar contenido' };

export default function SolicitarContenidoPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-hub max-w-lg py-10">
        <h1 className="text-2xl font-semibold text-ink">¿No encontraste lo que buscabas?</h1>
        <p className="mt-2 text-ink-soft">
          Cuéntanos qué contenido necesitas y el equipo de Infectonorte lo evaluará para el próximo ciclo de
          publicación.
        </p>
        <div className="mt-8">
          <ContentRequestForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

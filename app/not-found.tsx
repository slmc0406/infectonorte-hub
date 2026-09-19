import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { EmptyState } from '@/components/empty-state';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container-hub py-20">
        <EmptyState
          title="No encontramos esta página"
          description="El enlace puede estar mal escrito o el contenido ya no está disponible."
          actionLabel="Volver a la biblioteca"
          actionHref="/biblioteca"
        />
      </main>
      <SiteFooter />
    </>
  );
}

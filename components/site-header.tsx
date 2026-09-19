import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
      <div className="container-hub flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-500 text-sm font-bold text-white">
            IN
          </span>
          <span className="font-semibold tracking-tight text-ink">
            Infectonorte <span className="text-primary-600">HUB</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-soft md:flex">
          <Link href="/biblioteca" className="hover:text-ink">Biblioteca</Link>
          <Link href="/academia" className="hover:text-ink">Academia</Link>
          <Link href="/solicitar-contenido" className="hover:text-ink">Solicitar contenido</Link>
        </nav>
        <Button href="/instituciones" variant="secondary" size="sm">
          Acceder a mi institución
        </Button>
      </div>
    </header>
  );
}

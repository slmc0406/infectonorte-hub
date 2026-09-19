import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'Infectonorte HUB — Conocimiento clínico',
    template: '%s · Infectonorte HUB',
  },
  description:
    'Plataforma centralizada de conocimiento clínico de Infectonorte: algoritmos, protocolos, guías y herramientas para instituciones aliadas.',
  metadataBase: new URL('https://hub.infectonorte.com'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}

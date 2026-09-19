import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Infectonorte HUB",
  description: "Conocimiento clínico organizado, accesible y medible para las instituciones acompañadas por Infectonorte.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}<Toaster richColors position="top-right" closeButton /></body>
    </html>
  );
}

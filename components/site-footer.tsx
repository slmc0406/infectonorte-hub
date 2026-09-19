export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface-sunken">
      <div className="container-hub py-10 text-sm text-ink-faint">
        <p className="max-w-2xl">
          Infectonorte HUB reúne conocimiento clínico curado por Infectonorte para apoyo a la decisión.
          No sustituye el juicio clínico profesional ni constituye una historia clínica. Contenido marcado
          como demostrativo no debe usarse para decisiones clínicas reales.
        </p>
        <p className="mt-4">© {new Date().getFullYear()} Infectonorte. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

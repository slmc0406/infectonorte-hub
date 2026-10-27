export function formatCatalogDate(value: number) {
  return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(value)).replace(" de ", " ").replace(" de ", " ");
}

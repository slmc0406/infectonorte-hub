export default function LoadingBiblioteca() {
  return (
    <div className="container-hub py-10">
      <div className="h-8 w-64 animate-pulse rounded-md bg-surface-sunken" />
      <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded-md bg-surface-sunken" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-lg border border-border bg-surface-sunken" />
        ))}
      </div>
    </div>
  );
}

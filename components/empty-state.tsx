import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-strong bg-white px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken text-ink-faint">
        <SearchX size={22} strokeWidth={1.5} />
      </span>
      <h3 className="font-semibold text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-soft">{description}</p>}
      {actionLabel && actionHref && (
        <Button href={actionHref} variant="secondary" size="sm" className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

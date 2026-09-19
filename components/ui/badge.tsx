import { cn } from '@/lib/utils';
import { ResourceStatus } from '@/lib/types';
import { statusMeta } from '@/lib/utils';

export function StatusBadge({ status, className }: { status: ResourceStatus; className?: string }) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        meta.bg,
        meta.text,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-surface-raised px-2.5 py-1 text-xs font-medium text-ink-soft',
        className
      )}
    >
      {children}
    </span>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-accent-500 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
      Demo
    </span>
  );
}

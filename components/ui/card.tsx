import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface-raised shadow-subtle transition-shadow duration-150',
        className
      )}
      {...props}
    />
  );
}

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, id, ...props }, ref) => {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-soft">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'w-full rounded-md border border-border-strong bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint',
          'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100',
          error && 'border-state-vencido focus:ring-state-vencido/20',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-state-vencido">
          {error}
        </p>
      )}
    </div>
  );
});
Input.displayName = 'Input';

import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: {
    toggle: 'w-8 h-4',
    dot: 'w-3 h-3',
    translate: 'translate-x-4',
  },
  md: {
    toggle: 'w-11 h-6',
    dot: 'w-5 h-5',
    translate: 'translate-x-5',
  },
  lg: {
    toggle: 'w-14 h-7',
    dot: 'w-6 h-6',
    translate: 'translate-x-7',
  },
};

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
}: ToggleProps) {
  return (
    <label className={cn('flex items-center gap-3', disabled && 'opacity-50 cursor-not-allowed')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          sizeStyles[size].toggle,
          checked
            ? 'bg-primary-600 dark:bg-primary-500'
            : 'bg-secondary-200 dark:bg-dark-600'
        )}
      >
        <span
          className={cn(
            'inline-block rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out',
            sizeStyles[size].dot,
            checked ? sizeStyles[size].translate : 'translate-x-0.5',
            'mt-0.5'
          )}
        />
      </button>

      {(label || description) && (
        <div className="flex-1">
          {label && (
            <p className="text-sm font-medium text-secondary-900 dark:text-white">{label}</p>
          )}
          {description && (
            <p className="text-sm text-secondary-500 dark:text-secondary-400">{description}</p>
          )}
        </div>
      )}
    </label>
  );
}

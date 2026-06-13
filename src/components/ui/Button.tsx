import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600',
  secondary:
    'bg-secondary-200 text-secondary-900 hover:bg-secondary-300 focus:ring-secondary-400 dark:bg-secondary-700 dark:text-secondary-100 dark:hover:bg-secondary-600',
  outline:
    'border-2 border-secondary-300 bg-transparent text-secondary-700 hover:bg-secondary-50 focus:ring-secondary-200 dark:border-secondary-600 dark:text-secondary-300 dark:hover:bg-secondary-800',
  ghost:
    'bg-transparent text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-200 dark:text-secondary-300 dark:hover:bg-secondary-800',
  danger:
    'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 dark:bg-error-500 dark:hover:bg-error-600',
  success:
    'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 dark:bg-success-500 dark:hover:bg-success-600',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm font-medium rounded-lg',
  md: 'px-4 py-2 text-sm font-medium rounded-lg',
  lg: 'px-6 py-3 text-base font-medium rounded-xl',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.98]',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {rightIcon}
    </button>
  );
}

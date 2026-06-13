import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const variantStyles: Record<string, string> = {
  default: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
  success: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300',
  warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300',
  error: 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  outline: 'border border-secondary-300 text-secondary-700 dark:border-dark-600 dark:text-secondary-300',
};

const dotColors = {
  default: 'bg-secondary-500',
  primary: 'bg-primary-500',
 success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
 info: 'bg-blue-500',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
}

export function Card({
  children,
  variant = 'default',
  className,
  ...props
}: CardProps) {
  const variants = {
    default:
      'bg-white dark:bg-dark-800 border border-secondary-100 dark:border-dark-700',
    bordered:
      'bg-transparent border-2 border-secondary-200 dark:border-dark-600',
    elevated:
      'bg-white dark:bg-dark-800 shadow-soft dark:shadow-none border border-secondary-100 dark:border-dark-700',
  };

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden transition-all duration-200',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-6 py-4 border-b border-secondary-100 dark:border-dark-700', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-secondary-100 dark:border-dark-700 bg-secondary-50 dark:bg-dark-900',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

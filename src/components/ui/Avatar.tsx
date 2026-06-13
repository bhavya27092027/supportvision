import React from 'react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusColors = {
  online: 'bg-success-500',
  offline: 'bg-secondary-400',
  busy: 'bg-error-500',
  away: 'bg-warning-500',
};

export function Avatar({ name, src, size = 'md', className, status }: AvatarProps) {
  return (
    <div className={cn('relative inline-flex', className)}>
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center',
          'text-white font-medium',
          sizeStyles[size]
        )}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-dark-800',
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}

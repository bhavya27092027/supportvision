import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div
        className={cn(
          'relative w-full bg-white dark:bg-dark-800 rounded-2xl shadow-soft-lg',
          'border border-secondary-200 dark:border-dark-700',
          'animate-scale-in',
          sizeStyles[size]
        )}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between p-6 border-b border-secondary-100 dark:border-dark-700">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1.5 -mr-2 -mt-1"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}

        <div className="p-6 max-h-[60vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

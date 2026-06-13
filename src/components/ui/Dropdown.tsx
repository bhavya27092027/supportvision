import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({
  trigger,
  children,
  open,
  onOpenChange,
  align = 'right',
  className,
}: DropdownProps) {
  return (
    <div className="relative inline-block">
      <div onClick={() => onOpenChange(!open)}>{trigger}</div>

      <AnimatePresence>
        {open && (
          <div onClick={() => onOpenChange(false)} className="fixed inset-0 z-40" />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 mt-2 w-56 rounded-xl',
              'bg-white dark:bg-dark-800',
              'border border-secondary-200 dark:border-dark-600',
              'shadow-soft-lg',
              'py-2',
              align === 'right' ? 'right-0' : 'left-0',
              className
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  icon,
  variant = 'default',
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full px-4 py-2 text-sm text-left flex items-center gap-3 transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'danger'
          ? 'text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20'
          : 'text-secondary-700 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:bg-dark-700'
      )}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
}

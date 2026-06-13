import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores';

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800',
  error: 'bg-error-50 border-error-200 dark:bg-error-900/20 dark:border-error-800',
  warning: 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800',
  info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
};

const iconColors = {
  success: 'text-success-600 dark:text-success-400',
  error: 'text-error-600 dark:text-error-400',
  warning: 'text-warning-600 dark:text-warning-400',
  info: 'text-blue-600 dark:text-blue-400',
};

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.type];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'p-4 rounded-xl border shadow-soft',
                'bg-white dark:bg-dark-800',
                toastStyles[toast.type]
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColors[toast.type])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900 dark:text-white">
                    {toast.title}
                  </p>
                  {toast.message && (
                    <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                      {toast.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

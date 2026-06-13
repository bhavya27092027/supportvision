import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-secondary-800 dark:border-t-white border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-secondary-800 dark:border-b-white border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-secondary-800 dark:border-l-white border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-secondary-800 dark:border-r-white border-y-transparent border-l-transparent',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'absolute z-50 px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap',
              'bg-secondary-800 text-white dark:bg-white dark:text-secondary-800',
              positions[position]
            )}
          >
            {content}
            <span
              className={cn(
                'absolute w-0 h-0 border-4',
                arrows[position]
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

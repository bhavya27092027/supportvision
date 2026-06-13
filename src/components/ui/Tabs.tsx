import React from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  tabs: { id: string; label: string; badge?: string | number }[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('border-b border-secondary-200 dark:border-dark-700', className)}>
      <nav className="-mb-px flex gap-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative px-4 py-3 text-sm font-medium rounded-t-lg transition-colors',
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300'
              )}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.badge !== undefined && (
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs rounded-full',
                      isActive
                        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                        : 'bg-secondary-100 text-secondary-600 dark:bg-dark-700 dark:text-secondary-400'
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </span>

              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

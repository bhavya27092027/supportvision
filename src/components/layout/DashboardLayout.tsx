import React from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function DashboardLayout() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-950">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-200',
          sidebarCollapsed ? 'ml-20' : 'ml-72'
        )}
      >
        <Navbar />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

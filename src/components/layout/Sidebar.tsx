import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Video,
  History,
  FileVideo,
  Users,
  BarChart3,
  LogOut,
  ChevronRight,
  ChevronLeft,
  MonitorPlay,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, useUIStore } from '@/stores';
import { Avatar } from '@/components/ui';

const agentNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/sessions', label: 'Sessions', icon: Video },
  { path: '/history', label: 'History', icon: History },
  { path: '/recordings', label: 'Recordings', icon: FileVideo },
];

const adminNavItems = [
  { path: '/admin', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/sessions', label: 'Active Sessions', icon: MonitorPlay },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/logs', label: 'Logs', icon: History },
];

export function Sidebar() {
  const { user, signOut } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const location = useLocation();

  const navItems = user?.role === 'admin' ? adminNavItems : agentNavItems;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 280 }}
      transition={{ duration: 0.2 }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-dark-900 border-r border-secondary-200 dark:border-dark-700 z-40 flex flex-col"
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-secondary-200 dark:border-dark-700">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-secondary-900 dark:text-white">SupportVision</span>
            </motion.div>
          )}
        </AnimatePresence>

        {sidebarCollapsed && (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto">
            <Video className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-secondary-600 hover:bg-secondary-50 dark:text-secondary-400 dark:hover:bg-dark-800'
                  )}
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary-600 dark:text-primary-400')} />
                  <AnimatePresence mode="wait">
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-secondary-200 dark:border-dark-700">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar name={user?.name || 'User'} size="sm" />
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 mt-2"
            >
              <button
                onClick={signOut}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        className={cn(
          'absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white dark:bg-dark-800 border border-secondary-200 dark:border-dark-600 rounded-full flex items-center justify-center shadow-sm hover:bg-secondary-50 dark:hover:bg-dark-700 transition-colors'
        )}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </motion.aside>
  );
}

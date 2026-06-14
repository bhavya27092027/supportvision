import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Search, Moon, Sun, Menu, X, LogOut, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, useUIStore } from '@/stores';
import { Avatar, Button, Dropdown, DropdownItem } from '@/components/ui';

interface NavbarProps {
  showMenu?: boolean;
}

export function Navbar({ showMenu = true }: NavbarProps) {
  const { user } = useAuthStore();
  const { theme, setTheme, sidebarCollapsed, setSidebarOpen, addToast } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToast({
        type: 'info',
        title: 'Search',
        message: `Searching for "${searchQuery}"...`,
      });
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'sticky top-0 z-30 h-16 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md',
        'border-b border-secondary-200 dark:border-dark-700'
      )}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-4">
          {showMenu && sidebarCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-64 pl-10 pr-4 py-2 text-sm rounded-lg',
                  'bg-secondary-50 dark:bg-dark-800',
                  'border border-secondary-200 dark:border-dark-600',
                  'text-secondary-900 dark:text-white',
                  'placeholder:text-secondary-400',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'transition-all duration-200'
                )}
              />
            </div>
          </form>

          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          <Button variant="ghost" size="sm" className="p-2 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />
          </Button>

          <Dropdown
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
            trigger={
              <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-secondary-50 dark:hover:bg-dark-800 transition-colors">
                <Avatar name={user?.name || 'User'} size="sm" />
              </button>
            }
          >
            <div className="px-4 py-3 border-b border-secondary-100 dark:border-dark-700">
              <p className="text-sm font-medium text-secondary-900 dark:text-white">
                {user?.name}
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">
                {user?.email}
              </p>
            </div>
            <DropdownItem
              icon={<User className="w-4 h-4" />}
              onClick={() => {
                setDropdownOpen(false);
                navigate('/settings');
              }}
            >
              Profile
            </DropdownItem>
            <DropdownItem
              icon={<Settings className="w-4 h-4" />}
              onClick={() => {
                setDropdownOpen(false);
                navigate('/settings');
              }}
            >
              Settings
            </DropdownItem>
            <div className="border-t border-secondary-100 dark:border-dark-700 mt-1 pt-1">
              <DropdownItem
                icon={<LogOut className="w-4 h-4" />}
                variant="danger"
                onClick={async () => {
                  setDropdownOpen(false);

                  await useAuthStore.getState().signOut();

                  navigate('/login', { replace: true });
                }}
              >
                Sign Out
              </DropdownItem>
            </div>
          </Dropdown>
        </div>
      </div>
    </motion.header>
  );
}

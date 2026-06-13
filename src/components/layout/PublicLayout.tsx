import React from 'react';
import { Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-950">
      <Outlet />
    </div>
  );
}

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useUIStore } from '@/stores';
import { ToastContainer } from '@/components/ui';
import { DashboardLayout, PublicLayout } from '@/components/layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  JoinSessionPage,
  DashboardPage,
  SessionsPage,
  SessionPage,
  SessionDetailPage,
  HistoryPage,
  RecordingsPage,
  AdminAnalyticsPage,
  AdminSessionsPage,
  AdminUsersPage,
  AdminLogsPage,
} from '@/pages';

function App() {
  const { initialize, isInitialized } = useAuthStore();
  const { theme } = useUIStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [theme]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-dark-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-secondary-600 dark:text-secondary-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/join/:token" element={<JoinSessionPage />} />
        </Route>

        {/* Session Route (no layout) */}
        <Route
          path="/session/:sessionId"
          element={
            <ProtectedRoute>
              <SessionPage />
            </ProtectedRoute>
          }
        />

        {/* Agent Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:sessionId" element={<SessionDetailPage />} />
          <Route path="/recordings" element={<RecordingsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminAnalyticsPage />} />
          <Route path="/admin/sessions" element={<AdminSessionsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/logs" element={<AdminLogsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;

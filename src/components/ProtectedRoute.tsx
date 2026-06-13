import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'agent' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isInitialized, session } = useAuthStore();
  const location = useLocation();

  console.log('[ProtectedRoute] Checking:', {
    isInitialized,
    isLoading,
    hasUser: !!user,
    hasSession: !!session,
    userRole: user?.role
  });

  // Show loading while initializing or loading
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-dark-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-secondary-600 dark:text-secondary-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If we have a session but no user, auth is still processing
  // Don't redirect to login immediately - give it a moment
  if (!user && session) {
    console.log('[ProtectedRoute] Session exists but no user yet, waiting...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-dark-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-secondary-600 dark:text-secondary-400">Setting up your session...</p>
        </div>
      </div>
    );
  }

  // Only redirect to login if we have no user AND no session
  if (!user && !session) {
    console.log('[ProtectedRoute] No user or session, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access check
  if (requiredRole && user) {
    if (user.role !== requiredRole && user.role !== 'admin') {
      console.log('[ProtectedRoute] Role mismatch, redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  console.log('[ProtectedRoute] Access granted');
  return <>{children}</>;
}

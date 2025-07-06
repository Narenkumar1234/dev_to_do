import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAuth = false }) => {
  const { user, loading } = useAuth();
  const { currentTheme } = useTheme();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: currentTheme.colors.primary.light }}
          />
          <p style={{ color: currentTheme.colors.text.muted }}>Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is not required, always show the children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If auth is required but user is not authenticated, show sign-in
  if (requireAuth && !user) {
    const SignIn = React.lazy(() => import('./SignIn'));
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <SignIn />
      </React.Suspense>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Guards routes that require an authenticated session. When Supabase auth is
 * not configured the guard never blocks — guest access remains the default
 * experience, and deeper features surface sign-in prompts themselves.
 */
export default function RequireAuth({ children, requireSetup = true }) {
  const { isAuthenticated, configured } = useAuth();
  const location = useLocation();

  if (!configured && requireSetup) return children;
  if (!isAuthenticated) {
    // Remember the requested page so we can return after signing in.
    const from = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?from=${from}`} replace />;
  }
  return children;
}

import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Guards routes that require an authenticated session. While the stored
 * session is being restored a loading state is shown so protected pages
 * never flash the login screen. When Supabase auth is not configured the
 * guard never blocks — guest access remains the default experience, and
 * deeper features surface sign-in prompts themselves.
 */
export default function RequireAuth({ children, requireSetup = true }) {
  const { isAuthenticated, configured, status } = useAuth();
  const location = useLocation();

  if (configured && status === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-32 text-sm" style={{ color: 'var(--text-muted)' }} role="status">
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--brand-cyan)' }} aria-hidden="true" />
        Restoring your session…
      </div>
    );
  }

  if (!configured && requireSetup) return children;
  if (!isAuthenticated) {
    // Remember the requested page so we can return after signing in.
    const from = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?from=${from}`} replace />;
  }
  return children;
}

import { Link } from 'react-router-dom';
import { User, LogOut, ShieldCheck, MapPin, Download, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';

export default function ProfilePage() {
  const { session, isAuthenticated, configured, signOut } = useAuth();
  const user = session?.user;

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-4">
      <PageHeader
        eyebrow="Profile"
        title="Your account"
        description="Manage your AQI24 account and what it unlocks."
        accent="sky"
        className="mb-6"
      />

      {isAuthenticated && user ? (
        <div className="space-y-5">
          <div className="panel p-6 flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)' }}
            >
              <User size={22} className="text-sky-400" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-base font-bold truncate" style={{ color: 'var(--text-main)' }}>
                {user.email || user.user_metadata?.full_name || 'Signed in user'}
              </div>
              <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-faint)' }}>
                {user.email || 'Email hidden by provider'}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/my-locations" className="panel panel-hover block p-5">
              <MapPin size={16} className="text-sky-400" aria-hidden="true" />
              <div className="text-sm font-bold mt-2" style={{ color: 'var(--text-main)' }}>My Locations</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Manage your saved cities.</div>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-400">
                Open <ArrowRight size={12} aria-hidden="true" />
              </span>
            </Link>
            <Link to="/research" className="panel panel-hover block p-5">
              <Download size={16} className="text-emerald-400" aria-hidden="true" />
              <div className="text-sm font-bold mt-2" style={{ color: 'var(--text-main)' }}>Data & Downloads</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Datasets, charts and export options.</div>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                Open <ArrowRight size={12} aria-hidden="true" />
              </span>
            </Link>
          </div>

          <button
            onClick={signOut}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all cursor-pointer"
            style={{ color: '#fb7185', background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)' }}
          >
            <LogOut size={14} aria-hidden="true" /> Sign out
          </button>
        </div>
      ) : (
        <div className="panel p-6 text-center">
          <ShieldCheck size={28} className="mx-auto text-amber-400" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold" style={{ color: 'var(--text-main)' }}>You&rsquo;re browsing as a guest</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {configured
              ? 'Sign in to save your locations across devices and unlock downloadable datasets.'
              : 'Sign-in is not configured yet. Add Supabase credentials to your .env file to enable accounts.'}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link to="/login" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-900 bg-gradient-to-r from-sky-300 to-sky-400">
              Sign in
            </Link>
            <Link to="/" className="px-5 py-2.5 rounded-xl text-sm font-semibold border" style={{ color: 'var(--text-sub)', borderColor: 'var(--panel-border)' }}>
              Back to home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

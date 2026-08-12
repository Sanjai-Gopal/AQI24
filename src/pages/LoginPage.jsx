import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, KeyRound, ExternalLink, CheckCircle2, ShieldCheck, MapPin, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';

export default function LoginPage() {
  const { signIn, sendOtp, googleSignIn, isAuthenticated, configured } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const from = searchParams.get('from') || '/my-locations';

  const [mode, setMode] = useState('password'); // password | otp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  const goNext = () => {
    try { navigate(decodeURIComponent(from)); } catch { navigate('/my-locations'); }
  };

  if (isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16 pb-4 text-center">
        <div className="panel p-8">
          <CheckCircle2 size={32} className="mx-auto text-emerald-400" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold" style={{ color: 'var(--text-main)' }}>You&rsquo;re signed in</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Your session is active. You can manage saved locations and your profile now.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/my-locations" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-900 bg-gradient-to-r from-cyan-300 to-cyan-400">My Locations</Link>
            <Link to="/profile" className="px-5 py-2.5 rounded-xl text-sm font-semibold border" style={{ color: 'var(--text-sub)', borderColor: 'var(--panel-border)' }}>Profile</Link>
          </div>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'password') {
        const res = await signIn(email, password);
        if (res.error) { setError(res.error); return; }
        goNext();
      } else {
        const res = await sendOtp(email);
        if (res.error) { setError(res.error); return; }
        setOtpSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-12 pb-4">
      <PageHeader
        eyebrow="Sign in"
        title="Unlock saved locations"
        description="Sign in to save your favourite places, keep a personalised history and access downloadable datasets."
        accent="cyan"
        className="mb-6"
      />

      {!configured && (
        <div className="panel p-5 mb-5 text-xs leading-relaxed" style={{ borderColor: 'rgba(251,191,36,0.25)' }}>
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck size={14} className="text-amber-400" aria-hidden="true" />
            <span className="font-bold text-amber-300">Sign-in is not set up yet</span>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>
            Authentication requires Supabase credentials. Add <code className="font-mono text-cyan-400">VITE_SUPABASE_URL</code> and <code className="font-mono text-cyan-400">VITE_SUPABASE_ANON_KEY</code> to your <code className="font-mono text-cyan-400">.env</code> file to enable it.
          </p>
        </div>
      )}

      <div className="panel p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-1 rounded-lg p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--panel-border)' }}>
            {[
              { id: 'password', label: 'Password' },
              { id: 'otp', label: 'Email code' },
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setMode(m.id); setOtpSent(false); setError(null); }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${mode === m.id ? 'text-slate-900 bg-gradient-to-r from-cyan-300 to-cyan-400' : ''}`}
                style={mode === m.id ? undefined : { color: 'var(--text-muted)' }}
                aria-pressed={mode === m.id}
              >
                {m.label}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-faint)' }}>{mode === 'otp' ? 'Magic link' : 'Email + password'}</span>
        </div>

        {otpSent && (
          <div className="mb-4 rounded-xl p-3 text-xs flex items-center gap-2" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
            <CheckCircle2 size={13} aria-hidden="true" />
            A sign-in code was sent to <strong>{email}</strong>. Check your inbox.
          </div>
        )}

        <form onSubmit={submit} className="space-y-3.5">
          <label className="block">
            <span className="text-[10px] font-mono uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-faint)' }}>Email</span>
            <div className="flex items-center gap-2 rounded-xl px-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--panel-border)' }}>
              <Mail size={14} className="text-cyan-400 shrink-0" aria-hidden="true" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                className="w-full bg-transparent py-2.5 text-sm outline-none"
                style={{ color: 'var(--text-main)' }}
              />
            </div>
          </label>

          {mode === 'password' && (
            <label className="block">
              <span className="text-[10px] font-mono uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-faint)' }}>Password</span>
              <div className="flex items-center gap-2 rounded-xl px-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--panel-border)' }}>
                <Lock size={14} className="text-cyan-400 shrink-0" aria-hidden="true" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  aria-label="Password"
                  className="w-full bg-transparent py-2.5 text-sm outline-none"
                  style={{ color: 'var(--text-main)' }}
                />
              </div>
            </label>
          )}

          {error && (
            <p role="alert" className="text-xs" style={{ color: '#fb7185' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !configured}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-900 bg-gradient-to-r from-cyan-300 to-cyan-400 hover:from-cyan-200 hover:to-cyan-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            {mode === 'password' ? 'Sign in' : 'Email me a sign-in code'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <span className="h-px flex-1" style={{ background: 'var(--panel-border)' }} aria-hidden="true" />
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-faint)' }}>or</span>
          <span className="h-px flex-1" style={{ background: 'var(--panel-border)' }} aria-hidden="true" />
        </div>

        <button
          type="button"
          onClick={() => { setError(null); setLoading(true); googleSignIn(); }}
          disabled={!configured}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ color: 'var(--text-sub)', borderColor: 'var(--panel-border)' }}
        >
          <ExternalLink size={14} className="text-cyan-400" aria-hidden="true" />
          Continue with Google
        </button>

        <button
          type="button"
          onClick={goNext}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold border transition-all"
          style={{ color: 'var(--text-sub)', borderColor: 'var(--panel-border)' }}
        >
          Continue as guest
        </button>

        {configured && (
          <p className="mt-4 text-[11px] flex items-center gap-1.5 justify-center" style={{ color: 'var(--text-faint)' }}>
            <ShieldCheck size={11} aria-hidden="true" /> Passwords are handled by Supabase Auth — never stored in this app.
          </p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 text-center">
        <div className="panel p-4">
          <MapPin size={16} className="mx-auto text-cyan-400" aria-hidden="true" />
          <div className="text-[11px] font-semibold mt-2" style={{ color: 'var(--text-sub)' }}>Save locations</div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}>Jump back to your cities</div>
        </div>
        <div className="panel p-4">
          <Download size={16} className="mx-auto text-emerald-400" aria-hidden="true" />
          <div className="text-[11px] font-semibold mt-2" style={{ color: 'var(--text-sub)' }}>Export datasets</div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}>Charts and tables</div>
        </div>
      </div>
    </div>
  );
}

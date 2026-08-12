import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Loader2, CheckCircle2, ShieldCheck, MapPin, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { consumeReturnTo } from '../services/authService';
import PageHeader from '../components/ui/PageHeader';

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

export default function LoginPage() {
  const { signIn, sendOtp, googleSignIn, isAuthenticated, configured, status, oauthError } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState('password'); // password | otp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  const goNext = () => {
    const saved = consumeReturnTo();
    const target = saved || decodeURIComponent(searchParams.get('from') || '/my-locations');
    try { navigate(target); } catch { navigate('/my-locations'); }
  };

  // Returning from Google OAuth: once the session is ready, continue into
  // the app instead of stopping at the signed-in card.
  useEffect(() => {
    if (isAuthenticated && status === 'ready') {
      goNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, status]);

  if (status === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-32 text-sm" style={{ color: 'var(--text-muted)' }} role="status">
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--brand-cyan)' }} aria-hidden="true" />
        Restoring your session…
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

  const startGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const res = await googleSignIn(searchParams.get('from') || '');
      if (res?.error) setError(res.error);
    } finally {
      setGoogleLoading(false);
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
            Accounts need to be enabled for this deployment before you can sign in. You can keep exploring as a guest — nothing else changes.
          </p>
        </div>
      )}

      {(oauthError || error) && (
        <p role="alert" className="mb-4 text-xs rounded-xl p-3" style={{ color: '#fb7185', background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)' }}>
          {oauthError || error}
        </p>
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
        </div>

        {otpSent && (
          <div className="mb-4 rounded-xl p-3 text-xs flex items-center gap-2" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#12a85c' }}>
            <CheckCircle2 size={13} aria-hidden="true" />
            A sign-in code was sent to <strong>{email}</strong>. Check your inbox.
          </div>
        )}

        <form onSubmit={submit} className="space-y-3.5">
          <label className="block">
            <span className="text-[10px] font-mono uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-faint)' }}>Email</span>
            <div className="flex items-center gap-2 rounded-xl px-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--panel-border)' }}>
              <Mail size={14} className="text-sky-500 shrink-0" aria-hidden="true" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                autoComplete="email"
                className="w-full bg-transparent py-2.5 text-sm outline-none"
                style={{ color: 'var(--text-main)' }}
              />
            </div>
          </label>

          {mode === 'password' && (
            <label className="block">
              <span className="text-[10px] font-mono uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-faint)' }}>Password</span>
              <div className="flex items-center gap-2 rounded-xl px-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--panel-border)' }}>
                <Lock size={14} className="text-sky-500 shrink-0" aria-hidden="true" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  aria-label="Password"
                  autoComplete="current-password"
                  className="w-full bg-transparent py-2.5 text-sm outline-none"
                  style={{ color: 'var(--text-main)' }}
                />
              </div>
            </label>
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
          onClick={startGoogle}
          disabled={!configured || googleLoading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ color: 'var(--text-sub)', borderColor: 'var(--panel-border)', background: 'var(--panel-bg)' }}
        >
          {googleLoading ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <GoogleIcon />}
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => { const t = searchParams.get('from'); navigate(t ? decodeURIComponent(t) : '/'); }}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold border transition-all cursor-pointer"
          style={{ color: 'var(--text-sub)', borderColor: 'var(--panel-border)' }}
        >
          Continue as guest
        </button>

        {configured && (
          <p className="mt-4 text-[11px] flex items-center gap-1.5 justify-center" style={{ color: 'var(--text-faint)' }}>
            <ShieldCheck size={11} aria-hidden="true" /> Passwords are handled securely by the identity provider — never stored in this app.
          </p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 text-center">
        <div className="panel p-4">
          <MapPin size={16} className="mx-auto text-sky-500" aria-hidden="true" />
          <div className="text-[11px] font-semibold mt-2" style={{ color: 'var(--text-sub)' }}>Save locations</div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}>Jump back to your cities</div>
        </div>
        <div className="panel p-4">
          <Download size={16} className="mx-auto text-emerald-500" aria-hidden="true" />
          <div className="text-[11px] font-semibold mt-2" style={{ color: 'var(--text-sub)' }}>Export datasets</div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}>Charts and tables</div>
        </div>
      </div>
    </div>
  );
}

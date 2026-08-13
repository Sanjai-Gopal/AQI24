import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Loader2,
  Mail,
  Radar,
  Satellite,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthField from '../components/auth/AuthField';
import AuthPasswordField from '../components/auth/AuthPasswordField';
import { strengthScore } from '../components/auth/PasswordStrengthMeter';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FEATURES = [
  { icon: Zap, label: 'Real-time air quality intelligence' },
  { icon: Cpu, label: 'AI forecasting' },
  { icon: Satellite, label: 'Satellite observations' },
  { icon: Radar, label: 'HCHO hotspot detection' },
];

function GoogleGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 24 48 24z" />
    </svg>
  );
}

function BrandPanel() {
  return (
    <div className="auth-brand-inner">
      <div className="auth-logo">
        <div className="auth-logo-mark">
          <Sparkles size={18} aria-hidden="true" />
        </div>
        <div>
          <div className="auth-logo-name">AQI<span>24</span></div>
          <div className="auth-logo-tag">AI-Powered Atmospheric Intelligence</div>
        </div>
      </div>

      <div className="auth-visual" aria-hidden="true">
        <div className="av-glow" />
        <div className="av-rings"><i /><i /><i /></div>
        <div className="av-core" />
        <div className="av-particles"><i /><i /><i /><i /><i /><i /><i /></div>
      </div>

      <h1 className="auth-headline">
        Understand the Air.
        <br />
        Predict What&rsquo;s Next.
      </h1>
      <p className="auth-lead">
        Explore AI-powered air-quality intelligence combining ground observations,
        satellite data and environmental signals.
      </p>

      <ul className="auth-features" aria-label="AQI24 capabilities">
        {FEATURES.map(({ icon: Icon, label }) => (
          <li key={label} className="auth-feature">
            <span className="auth-feature-icon"><Icon size={14} aria-hidden="true" /></span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConfigNotice() {
  return (
    <div className="auth-notice auth-notice--warn" role="status">
      <ShieldCheck size={16} className="text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <p className="auth-notice-title" style={{ color: '#fbbf24' }}>
          Authentication service is not configured.
        </p>
        <p className="mt-0.5">
          Supabase authentication is currently unavailable. Continue as Guest to explore AQI24.
        </p>
        <p className="auth-notice-code mt-1.5">
          Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your{' '}
          <code>.env</code> file to enable accounts.
        </p>
      </div>
    </div>
  );
}

function StatusBanner({ status }) {
  if (!status) return null;
  const Icon = status.type === 'error' ? AlertCircle : status.type === 'success' ? CheckCircle2 : ShieldCheck;
  return (
    <div className={`auth-notice auth-notice--${status.type}`} role={status.type === 'error' ? 'alert' : 'status'}>
      <Icon size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
      <p>{status.message}</p>
    </div>
  );
}

export default function LoginPage() {
  const { isAuthenticated, configured, signIn, signUp, googleSignIn, resetPassword } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const requestedMode = searchParams.get('mode');
  const from = searchParams.get('from') || '/';

  const [mode, setMode] = useState(
    requestedMode === 'signup' ? 'signup' : requestedMode === 'forgot' ? 'forgot' : 'signin',
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(null); // null | 'signin' | 'signup' | 'forgot' | 'google'
  const [success, setSuccess] = useState(null); // { view: 'signup'|'forgot', needsConfirmation? }

  if (isAuthenticated) return <Navigate to={from} replace />;

  const configUnavailable = (action) => {
    setStatus({ type: 'info', message: `Supabase authentication is currently unavailable${action ? ` — ${action}` : ''}. Continue as Guest to explore AQI24.` });
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setStatus(null);
    setSuccess(null);
    setLoading(null);
    setConfirm('');
    const params = {};
    if (from !== '/') params.from = from;
    if (next === 'signup') params.mode = 'signup';
    setSearchParams(params, { replace: true });
  };

  const continueAsGuest = () => navigate('/');

  const onSignIn = async (e) => {
    e.preventDefault();
    if (!configured) return configUnavailable();
    const errs = {};
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!EMAIL_RE.test(email.trim())) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    if (Object.keys(errs).length) { setErrors(errs); setStatus(null); return; }
    setErrors({});
    setStatus(null);
    setLoading('signin');
    const res = await signIn(email.trim(), password);
    if (res.error) { setStatus({ type: 'error', message: res.error }); setLoading(null); return; }
    navigate(from);
  };

  const onSignUp = async (e) => {
    e.preventDefault();
    if (!configured) return configUnavailable('account creation');
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    else if (fullName.trim().length < 2) errs.fullName = 'Please enter your full name.';
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!EMAIL_RE.test(email.trim())) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    else if (strengthScore(password) < 2) errs.password = 'Use a stronger password — at least 8 characters with a mix of letters, numbers and symbols.';
    if (!confirm) errs.confirm = 'Confirm your password.';
    else if (password !== confirm) errs.confirm = 'Passwords do not match.';
    if (Object.keys(errs).length) { setErrors(errs); setStatus(null); return; }
    setErrors({});
    setStatus(null);
    setLoading('signup');
    const res = await signUp(email.trim(), password, fullName.trim());
    if (res.error) { setStatus({ type: 'error', message: res.error }); setLoading(null); return; }
    setLoading(null);
    setSuccess({ view: 'signup', needsConfirmation: Boolean(res.emailConfirmationRequired) });
  };

  const onForgot = async (e) => {
    e.preventDefault();
    if (!configured) return configUnavailable('password reset');
    const errs = {};
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!EMAIL_RE.test(email.trim())) errs.email = 'Enter a valid email address.';
    if (Object.keys(errs).length) { setErrors(errs); setStatus(null); return; }
    setErrors({});
    setStatus(null);
    setLoading('forgot');
    const res = await resetPassword(email.trim());
    if (res.error) { setStatus({ type: 'error', message: res.error }); setLoading(null); return; }
    setLoading(null);
    setSuccess({ view: 'forgot' });
  };

  const onGoogle = async () => {
    if (!configured) {
      setStatus({ type: 'info', message: 'Google sign-in requires Supabase configuration.' });
      return;
    }
    setStatus(null);
    setLoading('google');
    const res = await googleSignIn();
    if (res && res.error) { setStatus({ type: 'error', message: res.error }); setLoading(null); }
  };

  const signinForm = (
    <div>
      <h2 className="auth-heading">Welcome back</h2>
      <p className="auth-sub">Sign in to save places, keep a personalised history and download datasets.</p>

      <form onSubmit={onSignIn} noValidate className="mt-6">
        <AuthField
          id="signin-email"
          label="Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
          autoFocus
        />
        <AuthPasswordField
          id="signin-password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          error={errors.password}
        />
        <div className="auth-row">
          <button
            type="button"
            className="auth-link"
            onClick={() => switchMode('forgot')}
            disabled={!!loading}
          >
            Forgot password?
          </button>
        </div>
        <button type="submit" className="auth-btn-primary" disabled={!!loading} aria-busy={loading === 'signin'}>
          {loading === 'signin'
            ? <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Signing in...</>
            : 'Sign In'}
        </button>
      </form>

      <div className="auth-divider"><span>or</span></div>

      <button type="button" className="auth-btn-secondary" onClick={onGoogle} disabled={!!loading || !configured} aria-busy={loading === 'google'}>
        {loading === 'google'
          ? <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Signing in with Google...</>
          : <><GoogleGlyph /> Continue with Google</>}
      </button>
      {!configured && <p className="auth-note-muted">Google sign-in requires Supabase configuration.</p>}

      <button type="button" className="auth-btn-ghost" onClick={continueAsGuest}>
        Continue as Guest
      </button>

      <p className="auth-footer-note">
        New to AQI24?{' '}
        <button type="button" className="auth-link" onClick={() => switchMode('signup')} disabled={!!loading}>
          Create an account
        </button>
      </p>
    </div>
  );

  const signupForm = (
    <div>
      <h2 className="auth-heading">Create your account</h2>
      <p className="auth-sub">Join AQI24 to save places and get more from your forecast.</p>

      <form onSubmit={onSignUp} noValidate className="mt-6">
        <AuthField
          id="signup-name"
          label="Full Name"
          icon={User}
          value={fullName}
          onChange={setFullName}
          placeholder="Ada Lovelace"
          autoComplete="name"
          error={errors.fullName}
        />
        <AuthField
          id="signup-email"
          label="Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />
        <AuthPasswordField
          id="signup-password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint="Min 8 characters"
          error={errors.password}
          showStrength
        />
        <AuthPasswordField
          id="signup-confirm"
          label="Confirm Password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={errors.confirm}
        />
        <button type="submit" className="auth-btn-primary mt-4" disabled={!!loading} aria-busy={loading === 'signup'}>
          {loading === 'signup'
            ? <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Creating account...</>
            : 'Create Account'}
        </button>
      </form>

      <button type="button" className="auth-btn-ghost mt-3" onClick={continueAsGuest}>
        Continue as Guest
      </button>

      <p className="auth-footer-note">
        Already have an account?{' '}
        <button type="button" className="auth-link" onClick={() => switchMode('signin')} disabled={!!loading}>
          Sign in
        </button>
      </p>
    </div>
  );

  const forgotForm = (
    <div>
      <h2 className="auth-heading">Reset your password</h2>
      <p className="auth-sub">Enter your email address and we&rsquo;ll send you a link to reset your password.</p>

      <form onSubmit={onForgot} noValidate className="mt-6">
        <AuthField
          id="forgot-email"
          label="Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
          autoFocus
        />
        <button type="submit" className="auth-btn-primary mt-2" disabled={!!loading} aria-busy={loading === 'forgot'}>
          {loading === 'forgot'
            ? <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Sending reset link...</>
            : 'Send Reset Link'}
        </button>
      </form>

      <button type="button" className="auth-btn-ghost mt-3" onClick={() => switchMode('signin')} disabled={!!loading}>
        <ArrowLeft size={14} aria-hidden="true" /> Back to Sign In
      </button>
    </div>
  );

  return (
    <div className="auth-shell">
      <div className="auth-layout">
        <aside className="auth-brand">
          <BrandPanel />
        </aside>

        <section className="auth-card-wrap" aria-label="AQI24 authentication">
          <div className="auth-card panel">
            <div className="auth-mobile-brand md:hidden">
              <div className="auth-logo">
                <div className="auth-logo-mark">
                  <Sparkles size={18} aria-hidden="true" />
                </div>
                <div>
                  <div className="auth-logo-name">AQI<span>24</span></div>
                  <div className="auth-logo-tag">AI-Powered Atmospheric Intelligence</div>
                </div>
              </div>
            </div>

            {!configured && <ConfigNotice />}

            {!success && (
              <div className="auth-tabs" role="group" aria-label="Authentication mode">
                <button
                  type="button"
                  className="auth-tab"
                  aria-pressed={mode === 'signin'}
                  onClick={() => switchMode('signin')}
                  disabled={!!loading}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="auth-tab"
                  aria-pressed={mode === 'signup'}
                  onClick={() => switchMode('signup')}
                  disabled={!!loading}
                >
                  Create Account
                </button>
              </div>
            )}

            <StatusBanner status={status} />

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {success.view === 'signup' && (
                    <div className="text-center py-3">
                      <div className="auth-success-icon">
                        <CheckCircle2 size={26} aria-hidden="true" />
                      </div>
                      <h2 className="auth-heading mt-4">Account created successfully.</h2>
                      <p className="auth-sub mt-2">
                        {success.needsConfirmation
                          ? 'Check your email to verify your account. Once verified, you can sign in.'
                          : 'Your AQI24 account is ready. You can sign in now.'}
                      </p>
                      <button type="button" className="auth-btn-primary mt-6" onClick={() => switchMode('signin')}>
                        Back to Sign In
                      </button>
                    </div>
                  )}
                  {success.view === 'forgot' && (
                    <div className="text-center py-3">
                      <div className="auth-success-icon auth-success-icon--cyan">
                        <Mail size={24} aria-hidden="true" />
                      </div>
                      <h2 className="auth-heading mt-4">Check your inbox</h2>
                      <p className="auth-sub mt-2">
                        Password reset instructions have been sent to your email.
                      </p>
                      <button type="button" className="auth-btn-primary mt-6" onClick={() => switchMode('signin')}>
                        Back to Sign In
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {mode === 'forgot' ? forgotForm : mode === 'signup' ? signupForm : signinForm}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="auth-footer-note">
            <ShieldCheck size={11} aria-hidden="true" />
            {configured
              ? 'Passwords are handled securely by Supabase Auth — never stored in this app.'
              : 'Guest access requires no account. Passwords are never stored in this app.'}
          </p>
        </section>
      </div>
    </div>
  );
}

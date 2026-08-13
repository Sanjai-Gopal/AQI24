import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  isAuthConfigured,
  getSession,
  getOAuthCallbackParams,
  exchangeCodeForSession,
  signInWithEmail,
  signInWithOtp,
  signInWithGoogle,
  storeReturnTo,
  signOut as doSignOut,
} from '../services/authService';

const AuthContext = createContext(null);

/**
 * Auth provider. When Supabase is not configured the session is always null
 * and the UI shows setup states — nothing is faked.
 *
 * Session lifecycle:
 *   1. On mount, if the URL hash carries an OAuth `code` (returning from
 *      Google sign-in) the code is exchanged for a session first.
 *   2. Otherwise the stored token is validated (and refreshed if expired).
 *   3. `status` is `checking` until one of the above finishes, so protected
 *      routes can render a loading state instead of flashing the login page.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('checking'); // checking | ready
  const [oauthError, setOauthError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      // OAuth callback: exchange the returned code for a session.
      const cb = getOAuthCallbackParams();
      if (cb) {
        const raw = sessionStorage.getItem('aqi24_oauth_pkce');
        let verifier = null;
        try { verifier = raw ? JSON.parse(raw).verifier : null; } catch { verifier = null; }
        const res = await exchangeCodeForSession(cb.code, verifier);
        if (!active) return;
        if (res.session) {
          setSession(res.session);
        } else if (res.error) {
          setOauthError(res.error);
        }
        setStatus('ready');
        return;
      }
      const { session: s } = await getSession();
      if (!active) return;
      setSession(s);
      setStatus('ready');
    })();
    return () => { active = false; };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const result = await signInWithEmail(email, password);
    if (result.session) setSession(result.session);
    return result;
  }, []);

  const sendOtp = useCallback((email) => signInWithOtp(email), []);

  const googleSignIn = useCallback((from) => {
    storeReturnTo(from);
    return signInWithGoogle(from);
  }, []);

  const signOut = useCallback(async () => {
    await doSignOut();
    setSession(null);
  }, []);

  const value = useMemo(() => ({
    session,
    status,
    oauthError,
    isAuthenticated: Boolean(session),
    configured: isAuthConfigured(),
    signIn,
    sendOtp,
    googleSignIn,
    signOut,
  }), [session, status, oauthError, signIn, sendOtp, googleSignIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

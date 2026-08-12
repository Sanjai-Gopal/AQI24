import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { isAuthConfigured, getSession, signInWithEmail, signInWithOtp, signInWithGoogle, signOut as doSignOut } from '../services/authService';

const AuthContext = createContext(null);

/**
 * Auth provider. When Supabase is not configured the session is always null
 * and the UI shows setup states — nothing is faked.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('checking'); // checking | ready

  useEffect(() => {
    let active = true;
    getSession().then(({ session: s }) => {
      if (!active) return;
      setSession(s);
      setStatus('ready');
    });
    return () => { active = false; };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const result = await signInWithEmail(email, password);
    if (result.session) setSession(result.session);
    return result;
  }, []);

  const sendOtp = useCallback((email) => signInWithOtp(email), []);

  const googleSignIn = useCallback(() => signInWithGoogle(), []);

  const signOut = useCallback(async () => {
    await doSignOut();
    setSession(null);
  }, []);

  const value = useMemo(() => ({
    session,
    status,
    isAuthenticated: Boolean(session),
    configured: isAuthConfigured(),
    signIn,
    sendOtp,
    googleSignIn,
    signOut,
  }), [session, status, signIn, sendOtp, googleSignIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

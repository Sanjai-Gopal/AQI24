/**
 * Auth Service — AQI24
 * ====================
 * Authentication architecture backed by Supabase Auth (email/password,
 * email OTP, Google OAuth). Implemented against the public Supabase REST
 * auth endpoints so no client SDK is required.
 *
 * IMPORTANT: Authentication is only active when both VITE_SUPABASE_URL and
 * VITE_SUPABASE_ANON_KEY are configured. Until then every method returns a
 * clear "not configured" result — the UI shows setup states instead of
 * pretending login works. Passwords are never stored locally.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const TOKEN_KEY = 'aqi24_auth_token';

export function isAuthConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

async function request(path, { method = 'POST', body } = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error_description || json.msg || json.message || `HTTP ${res.status}`);
  }
  return json;
}

function notConfigured() {
  return {
    error: 'Sign-in is not set up yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file to enable authentication.',
  };
}

/** Email + password sign in. */
export async function signInWithEmail(email, password) {
  if (!isAuthConfigured()) return notConfigured();
  if (!email || !password) return { session: null, error: 'Enter your email and password.' };
  try {
    const data = await request('/auth/v1/token?grant_type=password', {
      body: { email, password },
    });
    if (data.access_token) localStorage.setItem(TOKEN_KEY, data.access_token);
    return { session: { user: data.user || null, access_token: data.access_token }, error: null };
  } catch (err) {
    return { session: null, error: err.message };
  }
}

/** Send a one-time password to an email address. */
export async function signInWithOtp(email) {
  if (!isAuthConfigured()) return notConfigured();
  if (!email) return { error: 'Enter your email address.' };
  try {
    await request('/auth/v1/otp', { body: { email, create_user: true } });
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/** Redirect to the Supabase-hosted Google OAuth flow. */
export async function signInWithGoogle() {
  if (!isAuthConfigured()) return notConfigured();
  const redirectTo = encodeURIComponent(`${window.location.origin}${window.location.pathname}`);
  window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`;
  return { ok: true, error: null };
}

/** Read the stored session from the token kept in localStorage. */
export async function getSession() {
  if (!isAuthConfigured()) return { session: null, error: null };
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return { session: null, error: null };
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      localStorage.removeItem(TOKEN_KEY);
      return { session: null, error: null };
    }
    const user = await res.json();
    return { session: { user }, error: null };
  } catch {
    return { session: null, error: null };
  }
}

export async function signOut() {
  if (!isAuthConfigured()) return notConfigured();
  try {
    await request('/auth/v1/logout', { method: 'POST' });
  } catch { /* token is removed regardless */ }
  localStorage.removeItem(TOKEN_KEY);
  return { error: null };
}

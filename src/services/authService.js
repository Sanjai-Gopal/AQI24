/**
 * Auth Service — AQI24
 * ====================
 * Authentication backed by Supabase Auth (email/password, email OTP,
 * Google OAuth). Implemented against the public Supabase REST auth
 * endpoints so no client SDK is required.
 *
 * IMPORTANT: Authentication is only active when both VITE_SUPABASE_URL and
 * VITE_SUPABASE_ANON_KEY are configured. Until then every method returns a
 * clear "not configured" result — the UI shows setup states instead of
 * pretending login works. Passwords are never stored locally.
 *
 * Google OAuth uses the PKCE authorization-code flow: a code verifier is
 * generated, the browser is redirected to Supabase, and when the user
 * returns with a `code`, that code is exchanged for a session. The app is
 * hash-routed, so the redirect target is `#/login` and the returned query
 * parameters are read from the URL hash.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const TOKEN_KEY = 'aqi24_auth_token';
const REFRESH_KEY = 'aqi24_auth_refresh';
const PKCE_STORE_KEY = 'aqi24_oauth_pkce';
const FROM_KEY = 'aqi24_auth_from';

export function isAuthConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

async function request(path, { method = 'POST', body, token } = {}) {
  const baseUrl = (SUPABASE_URL || '').replace(/\/$/, '');
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
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

function persistSession(data) {
  if (!data?.access_token) return;
  localStorage.setItem(TOKEN_KEY, data.access_token);
  if (data.refresh_token) localStorage.setItem(REFRESH_KEY, data.refresh_token);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(PKCE_STORE_KEY);
}

function buildSession(data) {
  return {
    user: data.user || null,
    access_token: data.access_token || null,
    expires_at: data.expires_at || null,
  };
}

// ─── PKCE helpers ────────────────────────────────────────────────────────
function randomVerifier() {
  // PKCE code verifier: 128 URL-safe characters (A-Z, a-z, 0-9, '-', '.', '_', '~').
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const bytes = new Uint8Array(128);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => charset[b % charset.length]).join('');
}

async function sha256Challenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Parse `code`/`state` out of the URL hash (hash-routed callback). */
export function getOAuthCallbackParams() {
  // Supabase may place the OAuth query parameters either before or after the
  // hash-router fragment. Check both so the callback is recognised either way.
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  const hashQuery = hash.includes('?') ? new URLSearchParams(hash.slice(hash.indexOf('?') + 1)) : new URLSearchParams();
  const code = searchParams.get('code') || hashQuery.get('code');
  const state = searchParams.get('state') || hashQuery.get('state');
  if (!code) return null;
  return { code, state };
}

/** Email + password sign in. */
export async function signInWithEmail(email, password) {
  if (!isAuthConfigured()) return notConfigured();
  if (!email || !password) return { session: null, error: 'Enter your email and password.' };
  try {
    const data = await request('/auth/v1/token?grant_type=password', {
      body: { email, password },
    });
    if (data.access_token) {
      persistSession(data);
      return { session: buildSession(data), error: null };
    }
    return { session: null, error: 'No session returned. Check your credentials.' };
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

/** Start Google OAuth. Redirects to Supabase; the callback returns to /login. */
export async function signInWithGoogle(from = '') {
  if (!isAuthConfigured()) return notConfigured();
  const verifier = randomVerifier();
  const state = Math.random().toString(36).slice(2);
  try {
    const codeChallenge = await sha256Challenge(verifier);
    sessionStorage.setItem(PKCE_STORE_KEY, JSON.stringify({ verifier, state }));
    if (from) sessionStorage.setItem(FROM_KEY, from);
    const redirectTo = `${window.location.origin}${window.location.pathname}#/login`;
    const url =
      `${SUPABASE_URL}/auth/v1/authorize` +
      `?provider=google` +
      `&redirect_to=${encodeURIComponent(redirectTo)}` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256` +
      `&state=${state}`;
    window.location.assign(url);
    return { ok: true, error: null };
  } catch {
    return { error: 'Could not start Google sign-in in this browser.' };
  }
}

/** Exchange an OAuth authorization code for a session (PKCE). */
export async function exchangeCodeForSession(code, verifier) {
  if (!isAuthConfigured()) return notConfigured();
  try {
    const data = await request('/auth/v1/token?grant_type=pkce', {
      body: { auth_code: code, code_verifier: verifier },
    });
    if (!data.access_token) return { session: null, error: 'Sign-in could not be completed.' };
    persistSession(data);
    sessionStorage.removeItem(PKCE_STORE_KEY);
    return { session: buildSession(data), error: null };
  } catch (err) {
    clearSession();
    return { session: null, error: err.message };
  }
}

/**
 * Restore a session. Validates the stored token against Supabase and, if it
 * has expired, attempts a refresh with the stored refresh token.
 */
export async function getSession() {
  if (!isAuthConfigured()) return { session: null, error: null };
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return { session: null, error: null };
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const user = await res.json();
      return { session: { user, access_token: token }, error: null };
    }
  } catch { /* fall through to refresh */ }

  // Try to refresh the expired token.
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (refreshToken) {
    try {
      const data = await request('/auth/v1/token?grant_type=refresh_token', {
        body: { refresh_token: refreshToken },
      });
      if (data.access_token) {
        persistSession(data);
        return { session: buildSession(data), error: null };
      }
    } catch { /* fall through */ }
  }
  clearSession();
  return { session: null, error: null };
}

/** Remember the destination to return to after signing in. */
export function storeReturnTo(from) {
  if (from) sessionStorage.setItem(FROM_KEY, from);
}

/** Read and clear the remembered destination. */
export function consumeReturnTo() {
  const from = sessionStorage.getItem(FROM_KEY);
  sessionStorage.removeItem(FROM_KEY);
  return from;
}

export async function signOut() {
  if (!isAuthConfigured()) return notConfigured();
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) await request('/auth/v1/logout', { method: 'POST', token });
  } catch { /* token is removed regardless */ }
  clearSession();
  return { error: null };
}

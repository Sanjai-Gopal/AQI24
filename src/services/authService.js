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
 *
 * Only the anon/public key is used here. Never use a service-role key in
 * the browser.
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
    const err = new Error(
      json.error_description || json.msg || json.message || json.code || `HTTP ${res.status}`,
    );
    err.code = json.code || json.error_code || json.error;
    throw err;
  }
  return json;
}

function notConfigured() {
  return {
    error: 'Supabase authentication is currently unavailable. Continue as Guest to explore AQI24.',
  };
}

/**
 * Map raw Supabase / network failures to friendly, non-technical messages so
 * users never see internal error strings.
 */
function friendlyError(err) {
  if (!err) return 'Something went wrong. Please try again.';
  const code = String(err.code || '').toLowerCase();
  const raw = String(err.message || '').toLowerCase();

  if (code === 'invalid_credentials' || raw.includes('invalid login credentials')) {
    return 'That email and password combination is not recognised. Check your details and try again.';
  }
  if (code === 'email_not_confirmed' || raw.includes('email not confirmed')) {
    return 'Your email address is not verified yet. Check your inbox for a confirmation link.';
  }
  if (code === 'user_already_exists' || code === 'user_already_in_use' || raw.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (code === 'weak_password' || raw.includes('weak password')) {
    return 'This password is too weak. Use at least 8 characters with a mix of letters, numbers and symbols.';
  }
  if (code === 'over_email_send_rate_limit' || raw.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (code === 'invalid_otp') {
    return 'The code you entered is not valid.';
  }
  if (code === 'session_not_found' || code === 'invalid_jwt') {
    return 'Your session has expired. Please sign in again.';
  }
  if (err instanceof TypeError || raw.includes('network') || raw.includes('failed to fetch')) {
    return 'Unable to reach the authentication service. Check your connection and try again.';
  }
  return 'Something went wrong while contacting the authentication service. Please try again.';
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
    return { session: null, error: friendlyError(err) };
  }
}

/** Create a new account with email + password and optional full name. */
export async function signUpWithEmail(email, password, fullName) {
  if (!isAuthConfigured()) return notConfigured();
  const trimmed = (email || '').trim();
  if (!trimmed || !password) return { session: null, error: 'Enter your email and password.' };
  try {
    const data = await request('/auth/v1/signup', {
      body: {
        email: trimmed,
        password,
        data: fullName ? { full_name: String(fullName).trim() } : {},
      },
    });
    if (data.access_token) {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      return {
        session: { user: data.user || null, access_token: data.access_token },
        emailConfirmationRequired: false,
        error: null,
      };
    }
    return {
      session: null,
      user: data.user || null,
      emailConfirmationRequired: true,
      error: null,
    };
  } catch (err) {
    return { session: null, error: friendlyError(err) };
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
    return { ok: false, error: friendlyError(err) };
  }
}

/** Send a password-reset email for an existing account. */
export async function sendPasswordReset(email) {
  if (!isAuthConfigured()) return notConfigured();
  const trimmed = (email || '').trim();
  if (!trimmed) return { error: 'Enter your email address.' };
  try {
    await request('/auth/v1/recover', { body: { email: trimmed } });
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: friendlyError(err) };
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

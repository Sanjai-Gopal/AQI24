const LEVELS = [
  { label: 'Weak', color: '#fb7185' },
  { label: 'Weak', color: '#fb7185' },
  { label: 'Fair', color: '#fbbf24' },
  { label: 'Good', color: '#38bdf8' },
  { label: 'Strong', color: '#34d399' },
];

/**
 * Simple password strength heuristic: length, mixed case, digits and
 * symbols. Returns 0–4. Used for both the live indicator and validation.
 */
export function strengthScore(password = '') {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export default function PasswordStrengthMeter({ password }) {
  const score = strengthScore(password);
  const level = LEVELS[score];

  return (
    <div className="mt-1.5" aria-live="polite">
      <div className="flex gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="pwd-seg"
            style={i <= score ? { background: level.color } : { background: 'rgba(148,163,184,0.18)' }}
          />
        ))}
      </div>
      {score > 0 && (
        <p className="mt-1 text-[10px] font-semibold" style={{ color: level.color }}>
          Password strength: {level.label}
        </p>
      )}
    </div>
  );
}

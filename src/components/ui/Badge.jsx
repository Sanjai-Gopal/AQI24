import { memo } from 'react';

const TONES = {
  live:    { color: '#34d399', bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.24)' },
  loading: { color: '#22d3ee', bg: 'rgba(34,211,238,0.1)',   border: 'rgba(34,211,238,0.24)' },
  error:   { color: '#fb7185', bg: 'rgba(251,113,133,0.1)',  border: 'rgba(251,113,133,0.24)' },
  modeled: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.24)' },
  neutral: { color: 'var(--text-muted)', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.16)' },
};

/**
 * Small status pill used for LIVE / Modeled / error / neutral states.
 * `pulse` renders an animated ping dot (use for live or loading states).
 */
export const StatusBadge = memo(({ tone = 'neutral', pulse = false, className = '', children }) => {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[11px] font-semibold ${className}`}
      style={{ color: t.color, background: t.bg, border: `1px solid ${t.border}` }}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70" style={{ background: t.color }} />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />
        </span>
      )}
      {children}
    </span>
  );
});

export default StatusBadge;

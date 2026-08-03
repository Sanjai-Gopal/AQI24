import { memo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

const PALETTE = {
  cyan:    { accent: '#22d3ee', bg: 'rgba(34,211,238,0.07)',  border: 'rgba(34,211,238,0.18)',  glow: 'rgba(34,211,238,0.12)' },
  amber:   { accent: '#fbbf24', bg: 'rgba(251,191,36,0.07)',  border: 'rgba(251,191,36,0.18)',  glow: 'rgba(251,191,36,0.12)' },
  rose:    { accent: '#fb7185', bg: 'rgba(251,113,133,0.07)', border: 'rgba(251,113,133,0.18)', glow: 'rgba(251,113,133,0.12)' },
  emerald: { accent: '#34d399', bg: 'rgba(52,211,153,0.07)',  border: 'rgba(52,211,153,0.18)',  glow: 'rgba(52,211,153,0.12)' },
  violet:  { accent: '#a78bfa', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.18)', glow: 'rgba(167,139,250,0.12)' },
};

function KPICard({ title, value, unit, change, changeLabel, icon: Icon, color = 'cyan', delay = 0, sub, isLoading }) {
  const c = PALETTE[color] || PALETTE.cyan;
  const isPositive = change > 0;
  const isNeutral  = change === 0 || change == null;
  const numericValue = typeof value === 'number' ? value : null;

  if (isLoading) {
    return (
      <div className="panel p-5 space-y-3" style={{ borderColor: c.border }}>
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-8 w-16 rounded" />
        <div className="skeleton h-2.5 w-32 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="panel panel-hover p-5 relative overflow-hidden cursor-default"
      style={{ borderColor: c.border }}
    >
      {/* corner glow */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: c.glow, filter: 'blur(28px)' }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
            {title}
          </span>
          {Icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: c.bg, border: `1px solid ${c.border}` }} aria-hidden="true">
              <Icon size={15} style={{ color: c.accent }} />
            </div>
          )}
        </div>

        <div className="flex items-end gap-1.5 mb-1.5">
          {numericValue != null ? (
            <AnimatedCounter
              value={numericValue}
              className="text-[1.6rem] font-extrabold font-mono leading-none tracking-tight"
            />
          ) : (
            <span className="text-[1.6rem] font-extrabold font-mono leading-none tracking-tight" style={{ color: 'var(--text-main)' }}>
              {value ?? '—'}
            </span>
          )}
          {unit && (
            <span className="text-sm font-semibold mb-0.5 font-mono" style={{ color: c.accent }}>{unit}</span>
          )}
        </div>

        {sub && (
          <p className="text-[11px] mb-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{sub}</p>
        )}

        {change != null && (
          <div className={`flex items-center gap-1 text-[11px] font-medium ${
            isNeutral ? 'text-slate-500' :
            isPositive ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {isNeutral
              ? <Minus size={11} aria-hidden="true" />
              : isPositive ? <TrendingUp size={11} aria-hidden="true" /> : <TrendingDown size={11} aria-hidden="true" />}
            <span>{isPositive ? '+' : ''}{change} {changeLabel}</span>
          </div>
        )}
      </div>

      {/* bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${c.accent}35, transparent)` }} />
    </motion.div>
  );
}

export default memo(KPICard);

import { memo } from 'react';
import { motion } from 'motion/react';
import { TriangleAlert as AlertTriangle, Info, Inbox } from 'lucide-react';

// ── Shared chart tooltip style ──────────────────────────────────────────
export const chartTooltipStyle = {
  contentStyle: {
    background: 'var(--card-bg-solid, #0d1424)',
    border: '1px solid var(--panel-border, rgba(34,211,238,0.2))',
    borderRadius: 10,
    color: 'var(--text-main, #e8edf5)',
    fontSize: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  },
  itemStyle: { color: 'var(--text-sub, #94a3b8)' },
  labelStyle: { color: 'var(--brand-cyan, #22d3ee)', fontFamily: 'monospace', fontWeight: 600 },
};

// ── Banner: modeled-data disclaimer (calm label) ───────────────────────
export const ModeledDataBanner = memo(() => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
    style={{ background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.18)', color: 'var(--text-muted)' }}>
    <Info size={13} className="shrink-0" style={{ color: 'var(--brand-cyan)' }} aria-hidden="true" />
    <span>Historical reference</span>
  </div>
));

// ── Banner: error state ─────────────────────────────────────────────────
export const ErrorBanner = memo(({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
    style={{ background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.18)' }}
  >
    <AlertTriangle size={16} className="text-rose-400 shrink-0" aria-hidden="true" />
    <span className="text-slate-400 flex-1">{message || 'An error occurred while loading data.'}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
      >
        Retry
      </button>
    )}
  </motion.div>
));

// ── Empty state ─────────────────────────────────────────────────────────
export const EmptyState = memo(({ title = 'No data available', message, icon: Icon = Inbox }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-12 text-center"
  >
    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
      style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.12)' }}>
      <Icon size={20} className="text-slate-500" aria-hidden="true" />
    </div>
    <div className="text-sm font-medium text-slate-400">{title}</div>
    {message && <div className="text-xs text-slate-600 mt-1 max-w-xs">{message}</div>}
  </motion.div>
));

// ── Panel title (standardized chart/section heading) ───────────────────
export const PanelTitle = memo(({ title, subtitle, mono = true }) => (
  <div className="mb-4">
    <div className="text-sm font-bold text-white">{title}</div>
    {subtitle && (
      <div className={`text-xs text-slate-500 mt-0.5 ${mono ? 'font-mono' : ''}`}>{subtitle}</div>
    )}
  </div>
));

// ── Styled select (replaces bare native selects) ───────────────────────
export const StyledSelect = memo(({ value, onChange, options, label, id }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={id} className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{label}</label>
    )}
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="appearance-none w-full bg-[var(--card-bg-solid)] border border-white/10 hover:border-white/20 focus:border-cyan-400/40 text-[var(--text-main)] text-xs font-mono rounded-lg px-3 py-2 pr-8 cursor-pointer transition-all outline-none"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[var(--card-bg-solid)] text-[var(--text-main)]">{opt.label}</option>
        ))}
      </select>
      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  </div>
));

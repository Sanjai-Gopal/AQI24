import { memo } from 'react';

const ACCENTS = {
  cyan:    '#22d3ee',
  amber:   '#fbbf24',
  violet:  '#a78bfa',
  emerald: '#34d399',
  rose:    '#fb7185',
};

/**
 * Pressable selector chip (city / source / season / view picker).
 * Active state uses the accent color; idle state is a subtle ghost chip.
 * The `size` variant mirrors the compact usage across data pages.
 */
export const ToggleChip = memo(({ active, onClick, children, accent = 'cyan', size = 'md', disabled, className = '', title }) => {
  const c = ACCENTS[accent] || ACCENTS.cyan;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-lg font-mono transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
        size === 'sm' ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'
      } ${active
        ? ''
        : 'border border-white/10 bg-white/[0.03] text-slate-500 hover:bg-white/[0.06] hover:text-slate-300'
      } ${className}`}
      style={active ? { color: c, background: `${c}1a`, border: `1px solid ${c}55` } : undefined}
    >
      {children}
    </button>
  );
});

/** Grouped selector row with an accessible group label. */
export const ChipGroup = memo(({ label, className = '', children }) => (
  <div role="group" aria-label={label} className={`flex flex-wrap gap-2 ${className}`}>
    {children}
  </div>
));

export default ToggleChip;

import { memo } from 'react';

const ACCENTS = {
  cyan:    '#22d3ee',
  violet:  '#a78bfa',
  amber:   '#fbbf24',
  emerald: '#34d399',
  rose:    '#fb7185',
};

/**
 * Standardized "footnote" panel used at the bottom of data pages to explain
 * methodology and provenance. Replaces the repeated hand-styled notes.
 */
export const MethodologyNote = memo(({ children, label = 'Methodology: ', accent = 'cyan', className = '' }) => {
  const c = ACCENTS[accent] || ACCENTS.cyan;
  return (
    <div
      className={`panel px-4 py-3.5 font-mono text-[11px] leading-relaxed text-slate-500 ${className}`}
      style={{ borderColor: `${c}1c` }}
    >
      <span className="font-semibold" style={{ color: c }}>{label}</span>
      {children}
    </div>
  );
});

export default MethodologyNote;

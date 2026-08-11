import { memo } from 'react';
import { motion } from 'motion/react';

function SectionHeader({ eyebrow, title, description, accent = 'cyan' }) {
  const colors = {
    cyan: '#22d3ee',
    amber: '#fbbf24',
    rose: '#fb7185',
    emerald: '#34d399',
    violet: '#a78bfa',
  };
  const color = colors[accent] || colors.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      {eyebrow && (
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-8" style={{ background: color }} aria-hidden="true" />
          <span className="text-xs font-mono tracking-widest uppercase" style={{ color }}>{eyebrow}</span>
        </div>
      )}
      <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h2>
      {description && <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-2xl">{description}</p>}
    </motion.div>
  );
}

export default memo(SectionHeader);

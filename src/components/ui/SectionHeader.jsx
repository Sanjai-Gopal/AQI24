import { memo } from 'react';
import { motion } from 'motion/react';

function SectionHeader({ eyebrow, title, description, accent = 'sky' }) {
  const colors = {
    sky: '#0d86de',
    cyan: '#0d86de',
    amber: '#c77f16',
    rose: '#e0526f',
    emerald: '#12a85c',
    violet: '#8b5cf6',
  };
  const color = colors[accent] || colors.sky;

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
          <span className="text-xs font-semibold tracking-[0.14em] uppercase" style={{ color }}>{eyebrow}</span>
        </div>
      )}
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>{title}</h2>
      {description && <p className="mt-2 text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>{description}</p>}
    </motion.div>
  );
}

export default memo(SectionHeader);

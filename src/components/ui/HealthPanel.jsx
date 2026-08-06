import { memo } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Activity, Sun } from 'lucide-react';
import { getHealthAdvice } from '../../utils/health';

/**
 * Health guidance panel derived from the current AQI value.
 * Renders the category, plain-language advice and concrete action chips.
 */
export const HealthPanel = memo(({ aqi, title = 'Health Guidance' }) => {
  const advice = getHealthAdvice(aqi);
  if (!advice) return null;

  const Icon = advice.max <= 50 ? Sun : Activity;

  return (
    <div className="panel relative h-full overflow-hidden p-5">
      <div
        className="absolute -top-8 -right-8 h-28 w-28 rounded-full pointer-events-none"
        style={{ background: `${advice.color}14`, filter: 'blur(24px)' }}
        aria-hidden="true"
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <Icon size={15} style={{ color: advice.color }} aria-hidden="true" />
          <span className="text-sm font-bold text-white">{title}</span>
        </div>
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase" style={{ color: advice.color }}>
          <ShieldCheck size={11} aria-hidden="true" />
          {advice.category}
        </div>
        <p className="mb-3 text-xs leading-relaxed text-slate-400">{advice.advice}</p>
        <div className="flex flex-wrap gap-1.5">
          {advice.actions.map(a => (
            <span
              key={a}
              className="rounded-md px-2 py-1 font-mono text-[10px]"
              style={{ background: `${advice.color}0d`, border: `1px solid ${advice.color}22`, color: advice.color }}
            >
              {a}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

export default HealthPanel;

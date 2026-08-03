import { memo, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import AnimatedCounter from './AnimatedCounter';
import { getAQICategory } from '../../utils/aqiUtils';

/* ── Gauge geometry ───────────────────────────────────────────────────
   270° arc, symmetric about the top, opening downward at the bottom.
   Angles are measured clockwise from 12 o'clock; `START` is the left
   endpoint (−135°) and the sweep runs clockwise to +135°.            */

const AQI_MAX = 500;
const SWEEP = 270;
const START = -135;

const SEGMENTS = [
  { to: 50,  color: '#34d399' },
  { to: 100, color: '#fbbf24' },
  { to: 150, color: '#fb923c' },
  { to: 200, color: '#f87171' },
  { to: 300, color: '#c084fc' },
  { to: 500, color: '#f43f5e' },
];

// Clockwise-from-top polar → cartesian (screen y inverted).
const polar = (fraction, r, cx, cy) => {
  const a = ((START + fraction * SWEEP) * Math.PI) / 180;
  return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) };
};

function arcPath(startFrac, endFrac, r, cx, cy) {
  const p1 = polar(startFrac, r, cx, cy);
  const p2 = polar(endFrac, r, cx, cy);
  const large = endFrac - startFrac > 0.5 ? 1 : 0;
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
}

/**
 * Animated 270° AQI gauge.
 *
 * Shows the full EPA color scale as a segmented arc, an animated needle that
 * sweeps to the current value, and the numeric readout in the bottom opening.
 */
function AQIGauge({ value, max = AQI_MAX, label = '', size = 260, accent = true }) {
  const cx = 120;
  const cy = 122;
  const r = 95;
  const needleLen = 64;

  const clamped = useMemo(() => Math.max(0, Math.min(max, Number(value) || 0)), [value, max]);
  const fraction = max > 0 ? clamped / max : 0;
  const color = accent ? (SEGMENTS.find(s => clamped <= s.to)?.color || '#f43f5e') : 'var(--text-sub)';
  const category = getAQICategory(clamped);
  const reduceMotion = useReducedMotion();
  const needleAngle = START + fraction * SWEEP;

  return (
    <div className="flex flex-col items-center" style={{ width: size, maxWidth: '100%' }}>
      <div role="img" aria-label={`AQI ${clamped}, ${category}${label ? ` — ${label}` : ''}`} className="w-full select-none">
        <svg viewBox="0 0 240 206" className="w-full" style={{ overflow: 'visible' }}>
          {/* Ambient glow behind the value color */}
          {accent && (
            <circle cx={cx} cy={cy - 12} r={78} fill={color} opacity={0.07} style={{ filter: 'blur(18px)' }} />
          )}

          {/* Background track */}
          <path
            d={arcPath(0, 1, r, cx, cy)}
            fill="none"
            stroke="rgba(148,163,184,0.14)"
            strokeWidth={16}
            strokeLinecap="round"
          />

          {/* Category segments */}
          {SEGMENTS.map((seg, i) => {
            const prev = i === 0 ? 0 : SEGMENTS[i - 1].to;
            return (
              <path
                key={seg.to}
                d={arcPath(prev / max, seg.to / max, r, cx, cy)}
                fill="none"
                stroke={seg.color}
                strokeWidth={16}
                strokeOpacity={0.9}
              />
            );
          })}

          {/* Needle */}
          <motion.g
            initial={{ rotate: reduceMotion ? needleAngle : START }}
            animate={{ rotate: needleAngle }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 52, damping: 13, mass: 0.9 }}
            style={{ transformBox: 'view-box', transformOrigin: `${cx}px ${cy}px` }}
          >
            <line
              x1={cx} y1={cy} x2={cx} y2={cy - needleLen}
              stroke="var(--text-main)" strokeWidth={3.5} strokeLinecap="round"
            />
          </motion.g>

          {/* Hub */}
          <circle cx={cx} cy={cy} r={7} fill="var(--text-main)" />
          <circle cx={cx} cy={cy} r={3} fill="var(--app-bg)" />

          {/* Readout in the bottom opening */}
          <text x={cx} y={cy + 34} textAnchor="middle" fill="var(--text-main)" fontSize={40} fontWeight={800}
            fontFamily="JetBrains Mono, monospace">
            <tspan>
              {Math.round(clamped)}
            </tspan>
          </text>
          <text x={cx} y={cy + 52} textAnchor="middle" fill={color} fontSize={11} fontWeight={700}
            fontFamily="JetBrains Mono, monospace" letterSpacing={2}>
            {category.toUpperCase()}
          </text>
          {label && (
            <text x={cx} y={cy + 70} textAnchor="middle" fill="var(--text-faint)" fontSize={10} fontFamily="JetBrains Mono, monospace">
              {label}
            </text>
          )}
        </svg>
      </div>
    </div>
  );
}

export default memo(AQIGauge);

/* Re-export the counter for callers that want an animated value elsewhere. */
export { AnimatedCounter };

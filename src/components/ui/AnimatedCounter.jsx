import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * Animated number counter that eases from 0 → target on mount/visibility.
 * Uses requestAnimationFrame for smooth, performant counting.
 * Falls back to an instant render when the user prefers reduced motion.
 */
export default function AnimatedCounter({
  value,
  duration = 900,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (value == null || isNaN(value)) {
      setDisplay(value);
      return;
    }
    const target = Number(value);
    if (target === display) return;

    if (reduceMotion) {
      setDisplay(target);
      return;
    }

    const animate = (timestamp) => {
      if (startRef.current == null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(target * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(target);
      }
    };

    startRef.current = null;
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const formatted = typeof display === 'number' && !isNaN(display)
    ? display.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : display;

  return (
    <span className={`counter-roll ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

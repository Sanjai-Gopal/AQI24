import { memo } from 'react';
import { motion } from 'motion/react';
import { Thermometer, Droplets, Wind, Activity } from 'lucide-react';
import { PanelTitle } from './Shared';

/**
 * Live atmospheric conditions strip (temperature, humidity, wind, dominant
 * pollutant) fed from the WAQI station payload. Shows skeletons while loading
 * and a graceful note when telemetry is unavailable for the selected timeline.
 */
export const WeatherStrip = memo(({ weather, status = 'idle', station = 'Delhi' }) => {
  const tiles = [
    { icon: Thermometer, label: 'Temperature', value: weather?.temperature != null ? `${weather.temperature}°C` : null },
    { icon: Droplets,    label: 'Humidity',    value: weather?.humidity != null ? `${weather.humidity}%` : null },
    { icon: Wind,        label: 'Wind',        value: weather?.wind != null ? `${weather.wind} km/h` : null },
    { icon: Activity,    label: 'Dominant',    value: weather?.dominantPollutant ? weather.dominantPollutant.toUpperCase() : null },
  ];

  const busy = status === 'loading';

  return (
    <div className="panel p-5">
      <PanelTitle title={`Atmospheric Conditions — ${station}`} subtitle="Live WAQI station telemetry" />
      {status === 'live' && weather ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {tiles.map(({ icon: Icon, label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl p-3"
              style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.12)' }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon size={12} className="text-cyan-400" aria-hidden="true" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{label}</span>
              </div>
              <div className="text-lg font-black font-mono text-white">{value ?? '—'}</div>
            </motion.div>
          ))}
        </div>
      ) : busy ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {tiles.map(t => (
            <div key={t.label} className="skeleton h-[68px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-xs text-slate-600 font-mono">
          Weather telemetry unavailable for this timeline.
        </div>
      )}
    </div>
  );
});

export default WeatherStrip;

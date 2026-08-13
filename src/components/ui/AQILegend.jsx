import { memo } from 'react';

const categories = [
  { label: 'Good', range: '0–50', color: '#34d399' },
  { label: 'Moderate', range: '51–100', color: '#fbbf24' },
  { label: 'Unhealthy (Sensitive)', range: '101–150', color: '#fb923c' },
  { label: 'Unhealthy', range: '151–200', color: '#f87171' },
  { label: 'Very Unhealthy', range: '201–300', color: '#c084fc' },
  { label: 'Hazardous', range: '301+', color: '#f43f5e' },
];

function AQILegend() {
  return (
    <div className="panel p-3 text-xs" role="img" aria-label="AQI color scale: Good, Moderate, Unhealthy for sensitive groups, Unhealthy, Very unhealthy, Hazardous">
      <div className="text-[var(--text-faint)] font-mono mb-2 text-xs tracking-wide">AQI SCALE</div>
      <div className="space-y-1.5">
        {categories.map((c) => (
          <div key={c.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: c.color }} aria-hidden="true" />
            <span className="text-[var(--text-main)]">{c.label}</span>
            <span className="text-[var(--text-muted)] ml-auto font-mono">{c.range}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(AQILegend);

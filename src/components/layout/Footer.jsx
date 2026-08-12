import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const footerNav = [
  { label: 'About', to: '/research/about' },
  { label: 'Methodology', to: '/research/methodology' },
  { label: 'Data Sources', to: '/research' },
  { label: 'Research & Data', to: '/research' },
];

export default function Footer() {
  return (
    <footer className="border-t px-4 py-10 mt-10" style={{ borderColor: 'var(--panel-border)', background: 'var(--app-bg-2)' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Sparkles size={16} className="text-sky-500" aria-hidden="true" />
            <span className="font-semibold text-sm tracking-wide" style={{ color: 'var(--text-main)' }}>AQI<span className="text-sky-500">24</span></span>
          </div>
          <p className="text-xs max-w-xs" style={{ color: 'var(--text-faint)' }}>
            Know tomorrow. Forecasts, historical records and research data for India&rsquo;s air quality.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-xs">
          {footerNav.map(item => (
            <Link
              key={item.label}
              to={item.to}
              className="transition-colors hover:text-cyan-400"
              style={{ color: 'var(--text-muted)' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]" style={{ borderColor: 'var(--panel-border)', color: 'var(--text-faint)' }}>
        <div>Current figures from WAQI, NASA FIRMS, Open-Meteo &middot; Historical records are modeled estimates.</div>
        <div>© 2026 AQI24</div>
      </div>
    </footer>
  );
}

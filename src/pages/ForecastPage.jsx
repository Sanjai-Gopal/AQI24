import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { History, ArrowRight, BookOpen } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import LocationPicker from '../components/ui/LocationPicker';
import ForecastDashboard from '../components/forecast/ForecastDashboard';
import { useLocation } from '../context/LocationContext';

export default function ForecastPage() {
  const { city } = useLocation();

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-4">
      <PageHeader
        eyebrow="Forecast · coming days"
        title="What will the air be like?"
        description="Weather forecast and air-quality outlook are shown separately. Air-quality values are derived from an atmospheric-model forecast (PM2.5 → AQI), not a live monitoring reading unless one is available."
        accent="sky"
      />

      <div className="flex justify-center mt-6">
        <LocationPicker />
      </div>
      <p className="text-center text-[11px] mt-3 mb-8" style={{ color: 'var(--text-faint)' }}>
        Forecasting for <span className="font-semibold" style={{ color: 'var(--brand-cyan)' }}>{city}</span>
      </p>

      <ForecastDashboard detailed />

      {/* ── Continue exploring ─────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-12 grid sm:grid-cols-2 gap-4"
        aria-label="Continue exploring"
      >
        <Link to="/history" className="panel panel-hover block p-5">
          <div className="flex items-center gap-2 mb-1">
            <History size={16} className="text-emerald-400" aria-hidden="true" />
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Explore the past</h3>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            See how air quality has changed across years — best and worst years, annual trends and year-on-year comparisons.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
            Explore past years <ArrowRight size={12} aria-hidden="true" />
          </span>
        </Link>

        <Link to="/research/methodology" className="panel panel-hover block p-5">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-amber-400" aria-hidden="true" />
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>How this forecast works</h3>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Read the full methodology — data sources, the AQI conversion, model details and honest limitations.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
            Read the methodology <ArrowRight size={12} aria-hidden="true" />
          </span>
        </Link>
      </motion.section>
    </div>
  );
}

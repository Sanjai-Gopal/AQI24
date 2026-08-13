import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, History, Map as MapIcon, FlaskConical, Sparkles } from 'lucide-react';
import LocationPicker from '../components/ui/LocationPicker';
import ForecastDashboard from '../components/forecast/ForecastDashboard';
import { useLocation } from '../context/LocationContext';

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const EXPLORE_LINKS = [
  { to: '/history', icon: History, title: 'Explore the past', desc: 'See how air quality and weather in your area have changed over the years.', accent: '#12a85c' },
  { to: '/map', icon: MapIcon, title: 'Air quality map', desc: 'Current air quality and fire activity across India, right on a map.', accent: '#0d86de' },
  { to: '/research', icon: FlaskConical, title: 'Research & data', desc: 'For students and researchers — data sources, methodology and model details.', accent: '#7c3aed' },
];

export default function HomePage() {
  const { city } = useLocation();

  return (
    <div className="relative">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 pt-12 md:pt-16 pb-2 text-center">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: 'var(--text-faint)' }}
        >
          Air quality where monitoring stations cannot reach
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="mt-5 text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] tracking-tight"
          style={{ color: 'var(--text-main)' }}
        >
          Know the air quality around you — even where monitoring stations are unavailable.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="mt-5 text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
          style={{ color: 'var(--text-muted)' }}
        >
          AQI24 combines monitoring-station information, spatial estimation and forecasting to make air-quality insights easier to understand.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/map"
            className="btn-glow inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 transition-all shadow-md"
          >
            Open the map <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Link
            to="/forecast"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all border"
            style={{ color: 'var(--text-sub)', borderColor: 'var(--panel-border)', background: 'var(--panel-bg)' }}
          >
            View forecast
          </Link>
        </motion.div>
      </section>

      {/* ── AQI24 flow ─────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.24 }}
        className="max-w-3xl mx-auto px-4 mt-8"
        aria-label="How AQI24 works"
      >
        <div className="panel p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-semibold text-[var(--text-main)]">
            {['Your location', 'Nearby stations', 'Spatial estimate', 'PM2.5 / AQI', 'Forecast'].map((label, i, arr) => (
              <div key={label} className="flex items-center gap-2 sm:gap-3">
                <div className="px-2.5 py-1.5 rounded-lg border" style={{ borderColor: 'var(--panel-border)', background: 'var(--app-bg-2)' }}>{label}</div>
                {i < arr.length - 1 && <ArrowRight size={12} className="text-[var(--text-faint)]" aria-hidden="true" />}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[11px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
            Traditional air-quality apps stop where stations end. AQI24 keeps going by estimating from nearby-station spatial information where supported.
          </p>
        </div>
      </motion.section>

      {/* ── Location ─────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.28 }}
        className="max-w-2xl mx-auto px-4 mt-9"
        aria-label="Choose your location"
      >
        <div className="panel p-5">
          <p className="text-sm font-semibold mb-4 flex items-center justify-center gap-2" style={{ color: 'var(--text-main)' }}>
            <Sparkles size={15} className="text-sky-500" aria-hidden="true" />
            Where are you?
          </p>
          <LocationPicker />
          <p className="mt-4 text-center text-xs" style={{ color: 'var(--text-faint)' }}>
            Showing conditions for <span className="font-semibold text-sky-600">{city}</span> — change it anytime.
          </p>
        </div>
      </motion.section>

      {/* ── The forecast ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pt-12" aria-labelledby="forecast-heading">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-5 text-center md:text-left"
        >
          <p className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
            {greeting()}, {city}.
          </p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Weather forecast and air-quality outlook for the next few days.
          </p>
        </motion.div>
        <ForecastDashboard />
      </section>

      {/* ── Discover more ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 mt-14" aria-labelledby="explore-heading">
        <div className="flex items-center gap-2 mb-5">
          <span id="explore-heading" className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Discover more</span>
          <span className="h-px flex-1" style={{ background: 'var(--panel-border)' }} aria-hidden="true" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {EXPLORE_LINKS.map(({ to, icon: Icon, title, desc, accent }, i) => (
            <motion.div key={to} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i }}>
              <Link to={to} className="panel panel-hover h-full block p-5">
                <Icon size={20} style={{ color: accent }} aria-hidden="true" />
                <h3 className="mt-3 text-sm font-bold" style={{ color: 'var(--text-main)' }}>{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: accent }}>
                  Open <ArrowRight size={12} aria-hidden="true" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BookOpen, BarChart3, CloudSun, FlaskConical, Satellite, Database, KeyRound, Check, X, Info } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { satelliteData } from '../data/mockData';

const SUBPAGES = [
  {
    to: '/research/methodology',
    icon: BookOpen,
    title: 'Methodology',
    desc: 'How AQI24 turns observed pollution and model output into clear forecasts — step by step.',
    accent: '#22d3ee',
  },
  {
    to: '/research/models',
    icon: CloudSun,
    title: 'Model information',
    desc: 'The machine-learning experiments in this build — a fire-radiative-power regressor and a fire-severity classifier — their inputs, and their limits.',
    accent: '#a78bfa',
  },
  {
    to: '/research/indicators',
    icon: Satellite,
    title: 'Air quality indicators',
    desc: 'Satellite-derived indicators such as HCHO hotspots — their sources and how to read them.',
    accent: '#34d399',
  },
  {
    to: '/research/analytics',
    icon: BarChart3,
    title: 'Trends & Analytics',
    desc: 'Yearly, monthly and regional air-quality trends with exportable charts.',
    accent: '#fbbf24',
  },
  {
    to: '/research/about',
    icon: FlaskConical,
    title: 'About AQI24',
    desc: 'The project, its goals, and how the data behind it is produced.',
    accent: '#fb7185',
  },
];

const SOURCES = [
  {
    name: 'WAQI',
    what: 'Current air quality from monitoring stations',
    env: 'VITE_WAQI_API_TOKEN',
    configured: Boolean(import.meta.env.VITE_WAQI_API_TOKEN),
  },
  {
    name: 'Open-Meteo CAMS',
    what: '7-day air quality forecast (atmospheric model)',
    env: 'No key required',
    configured: true,
  },
  {
    name: 'NASA FIRMS',
    what: 'Active fire reports (MODIS / VIIRS)',
    env: 'VITE_NASA_FIRMS_MAP_KEY',
    configured: Boolean(import.meta.env.VITE_NASA_FIRMS_MAP_KEY),
  },
  {
    name: 'CPCB baselines',
    what: 'Historical reference records (modeled estimates)',
    env: 'Bundled dataset',
    configured: true,
  },
];

export default function ResearchPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-4 space-y-8">
      <PageHeader
        eyebrow="Research & Data"
        title="Built on real environmental data"
        description="Every figure in AQI24 traces to a verifiable source — a monitoring station, an atmospheric model, a satellite, or a clearly-labelled historical reference. Nothing is randomly generated."
        accent="amber"
      />

      {/* Sub-pages */}
      <section aria-labelledby="res-subpages">
        <div className="flex items-center gap-2 mb-4">
          <span id="res-subpages" className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Explore</span>
          <span className="h-px flex-1" style={{ background: 'var(--panel-border)' }} aria-hidden="true" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBPAGES.map(({ to, icon: Icon, title, desc, accent }, i) => (
            <motion.div key={to} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={to} className="panel panel-hover h-full block p-5">
                <Icon size={20} style={{ color: accent }} aria-hidden="true" />
                <h3 className="mt-3 text-sm font-bold" style={{ color: 'var(--text-main)' }}>{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </Link>
            </motion.div>
          ))}

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="panel p-5 h-full flex flex-col justify-between" style={{ borderColor: 'rgba(34,211,238,0.2)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Info size={16} className="text-cyan-400" aria-hidden="true" />
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Configuring data sources</h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Copy <code className="font-mono text-cyan-400">.env.example</code> to <code className="font-mono text-cyan-400">.env</code> and add your free API keys. Without keys the app shows clearly-labelled reference records — it never pretends to be current.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Data sources */}
      <section aria-labelledby="res-sources">
        <div className="flex items-center gap-2 mb-4">
          <Database size={14} className="text-cyan-400" aria-hidden="true" />
          <span id="res-sources" className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Data sources in this build</span>
          <span className="h-px flex-1" style={{ background: 'var(--panel-border)' }} aria-hidden="true" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {SOURCES.map(s => (
            <div key={s.name} className="panel p-4 flex items-start gap-3">
              <span className="mt-0.5">
                {s.configured
                  ? <Check size={16} className="text-emerald-400" aria-hidden="true" />
                  : <X size={16} className="text-amber-400" aria-hidden="true" />}
              </span>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{s.name}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.what}</div>
                <div className="text-[10px] font-mono mt-1.5" style={{ color: s.configured ? 'var(--text-faint)' : '#fbbf24' }}>
                  {s.configured ? `Configured · ${s.env}` : `Not configured · add ${s.env}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Satellite datasets */}
      <section aria-labelledby="res-datasets">
        <div className="flex items-center gap-2 mb-4">
          <Satellite size={14} className="text-emerald-400" aria-hidden="true" />
          <span id="res-datasets" className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Reference satellite datasets</span>
          <span className="h-px flex-1" style={{ background: 'var(--panel-border)' }} aria-hidden="true" />
        </div>
        <div className="panel p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <caption className="sr-only">Reference satellite datasets used by AQI24</caption>
              <thead>
                <tr className="font-mono uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-faint)' }}>
                  <th scope="col" className="text-left pb-2 pr-6">Satellite</th>
                  <th scope="col" className="text-left pb-2 pr-6">Parameter</th>
                  <th scope="col" className="text-left pb-2 pr-6">Since</th>
                  <th scope="col" className="text-left pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {satelliteData.map(s => (
                  <tr key={s.name} className="border-t" style={{ borderColor: 'var(--panel-border)' }}>
                    <td className="py-2 pr-6 font-mono font-bold text-cyan-400">{s.name}</td>
                    <td className="py-2 pr-6" style={{ color: 'var(--text-sub)' }}>{s.param}</td>
                    <td className="py-2 pr-6 font-mono" style={{ color: 'var(--text-faint)' }}>{s.since}</td>
                    <td className="py-2 font-mono text-emerald-400">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Configuration */}
      <section aria-labelledby="res-config" className="panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <KeyRound size={15} className="text-amber-400" aria-hidden="true" />
          <span id="res-config" className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Environment configuration</span>
        </div>
        <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
          Keys are read from <code className="font-mono text-cyan-400">import.meta.env</code> and never exposed in the UI. Sign-in is optional and uses Supabase.
        </p>
        <ul className="space-y-2 text-xs font-mono" style={{ color: 'var(--text-sub)' }}>
          <li><span className="text-cyan-400">VITE_WAQI_API_TOKEN</span> — aqicn.org/data-platform/token</li>
          <li><span className="text-cyan-400">VITE_NASA_FIRMS_MAP_KEY</span> — firms.modaps.eosdis.nasa.gov/api/area/</li>
          <li><span className="text-cyan-400">VITE_SUPABASE_URL</span> / <span className="text-cyan-400">VITE_SUPABASE_ANON_KEY</span> — optional sign-in</li>
          <li><span className="text-cyan-400">VITE_GEMINI_API_KEY</span> — optional AI assistance</li>
        </ul>
      </section>
    </div>
  );
}

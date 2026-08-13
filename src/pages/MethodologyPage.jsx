import { motion } from 'motion/react';
import SectionHeader from '../components/ui/SectionHeader';
import { PanelTitle } from '../components/ui/Shared';
import { Database, Cpu, ChartBar as BarChart3, Globe, Layers, ArrowRight, Clock, Brain, Target, Activity, CircleDot } from 'lucide-react';

const pipeline = [
  {
    step: '01',
    title: 'Data Acquisition',
    icon: Database,
    color: '#22d3ee',
    items: [
      'WAQI — current air quality from monitoring stations (when an API token is set)',
      'Open-Meteo CAMS — 7-day atmospheric air-quality forecast (PM2.5 and other species)',
      'NASA FIRMS — active fire detections from MODIS and VIIRS (when an API key is set)',
      'Bundled reference records — historical AQI, PM2.5 and fire baselines derived from CPCB data',
      'Sentinel-5P TROPOMI — HCHO column reference geometry for hotspot maps',
    ],
  },
  {
    step: '02',
    title: 'Preprocessing & Harmonization',
    icon: Layers,
    color: '#a78bfa',
    items: [
      'Station readings are paired to the selected city using a 100-km search radius; distance is always shown',
      'AQI values are converted to the standard Indian AQI scale used throughout the app',
      'Fire FRP (fire radiative power) is computed from satellite brightness temperatures and cleaned for outliers',
      'Reference records are clearly labelled whenever they stand in for a missing current feed — nothing is invented',
    ],
  },
  {
    step: '03',
    title: 'Feature Engineering',
    icon: Cpu,
    color: '#fbbf24',
    items: [
      'For fire models: brightness temperature, temp_diff, scan/track geometry, pixel area, day/night flag',
      'Temporal features: year, month, day-of-year, hour, and sin/cos cyclical encodings',
      'Spatial features: latitude, longitude, season, region',
      'FRP target is log₁₊-transformed to handle its right-skewed distribution',
    ],
  },
  {
    step: '04',
    title: 'Machine-Learning Models (in this build)',
    icon: Brain,
    color: '#34d399',
    items: [
      'LightGBM regressor — predicts fire radiative power (MW) from FIRMS VIIRS S-NPP detections (log₁₊ target)',
      'XGBoost classifier — predicts fire severity class: Low (<10 MW), Medium (10–50), High (50–200), Extreme (>200)',
      'Training: 202,243 VIIRS detections (2012–2024); test: 125,919 detections (2025–2026) — a temporal split',
      'Metrics (RMSE, MAE, R², accuracy) are computed on that held-out test period only',
      'The 7-day AQI forecast shown in the app is the Open-Meteo CAMS atmospheric model — an AQI24-trained AQI model is planned future work, not yet in this build',
    ],
  },
  {
    step: '05',
    title: 'Interpolation & Visualization',
    icon: Globe,
    color: '#fb7185',
    items: [
      'HCHO column density shown as reference hex-bin clusters on the map',
      'Fire detections rendered as point markers sized by FRP intensity',
      'Leaflet.js interactive map with multiple tile styles',
      'Recharts time series and bar charts with Framer Motion transitions',
    ],
  },
];

const satellites = [
  { name: 'Sentinel-5P TROPOMI', agency: 'ESA / Copernicus', param: 'HCHO, NO₂, SO₂, O₃, CO, Aerosol', res: '3.5×5.5 km', revisit: 'Daily ~13:30 LT', color: '#a78bfa', status: 'Reference', statusColor: '#64748b' },
  { name: 'MODIS Terra + Aqua', agency: 'NASA GSFC', param: 'AOD (Deep Blue/DT), Active Fire', res: '1 km / 500 m', revisit: '2× daily', color: '#22d3ee', status: 'Live feed', statusColor: '#34d399' },
  { name: 'VIIRS NPP / NOAA-20', agency: 'NASA / NOAA', param: 'Active Fire 375 m', res: '375 m', revisit: 'Daily', color: '#fbbf24', status: 'Live feed', statusColor: '#34d399' },
  { name: 'INSAT-3DR', agency: 'ISRO SAC', param: 'LST, Water Vapour, Cloud Mask', res: '4 km', revisit: '30-min', color: '#34d399', status: 'Not in this build', statusColor: '#64748b' },
  { name: 'MERRA-2 Reanalysis', agency: 'NASA GMAO', param: 'Meteorology, PBLH, RH, Wind, Temp', res: '0.5°×0.625°', revisit: 'Hourly (1980–present)', color: '#60a5fa', status: 'Not in this build', statusColor: '#64748b' },
];

export default function MethodologyPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <SectionHeader
        eyebrow="Methodology"
        title="Methodology & Data Architecture"
        description="How AQI24 turns observed pollution, atmospheric forecasts, satellite fire detections and reference records into the charts and maps you see — with the machine-learning experiments in this build explained plainly."
        accent="cyan"
      />

      {/* Pipeline steps */}
      <div className="space-y-4">
        {pipeline.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{ y: -2 }}
              className="panel panel-hover p-5"
              style={{ borderColor: `${step.color}20` }}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  whileHover={{ rotate: 6, scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}
                >
                  <Icon size={20} style={{ color: step.color }} aria-hidden="true" />
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono font-bold" style={{ color: step.color }}>STEP {step.step}</span>
                    <h3 className="font-bold text-white text-sm">{step.title}</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {step.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                        <ArrowRight size={12} className="mt-1 flex-shrink-0" style={{ color: step.color }} aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Satellite table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        className="panel overflow-hidden"
      >
        <div className="p-5 border-b border-white/5">
          <PanelTitle title="Satellite reference datasets" subtitle="How each mission is used in this build" />
        </div>
        <div className="overflow-x-auto scroll-fade-x">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {['Satellite / Instrument', 'Agency', 'Parameters', 'Resolution', 'Revisit', 'Status'].map((h) => (
                  <th key={h} scope="col" className="text-left py-3 px-4 text-slate-500 font-mono tracking-wider uppercase text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {satellites.map((s, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                  <td className="py-3 px-4" style={{ color: s.color }}>{s.agency}</td>
                  <td className="py-3 px-4 text-slate-400">{s.param}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{s.res}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{s.revisit}</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 font-mono text-[11px]" style={{ color: s.statusColor }}>
                      {s.status === 'Live feed'
                        ? <><CircleDot size={11} aria-hidden="true" /> {s.status}</>
                        : s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Model performance */}
      <div>
        <div className="text-xs font-mono tracking-widest text-cyan-400 mb-1">FIRE MODEL PERFORMANCE</div>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          Measured on the held-out 2025–2026 test detections. These models predict fire intensity — the AQI forecast in the app is the Open-Meteo CAMS atmospheric model, not these.
        </p>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'FRP RMSE', value: '6.56', sub: 'MW — LightGBM regressor on held-out test', color: '#22d3ee' },
            { label: 'FRP MAE', value: '2.23', sub: 'MW — mean absolute error, log-target', color: '#34d399' },
            { label: 'FRP R² (log)', value: '0.68', sub: 'Coefficient of determination on log₁₊ FRP', color: '#a78bfa' },
            { label: 'Severity accuracy', value: '89.6%', sub: 'XGBoost classifier, 4 classes', color: '#fbbf24' },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className="panel panel-hover p-5 text-center relative overflow-hidden"
              style={{ borderColor: `${m.color}20` }}
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none"
                style={{ background: `${m.color}15`, filter: 'blur(16px)' }} />
              <div className="relative z-10">
                <div className="text-3xl font-black font-mono mb-2 flex items-center justify-center gap-2" style={{ color: m.color }}>
                  {m.value}
                </div>
                <div className="text-sm font-semibold text-white">{m.label}</div>
                <div className="text-xs text-slate-500 mt-1">{m.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Training data summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        className="panel p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-emerald-400" aria-hidden="true" />
          <h3 className="font-semibold text-white text-sm">Fire Model Training Data</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total archive', value: '8.6M+', sub: 'NASA FIRMS VIIRS detections (2012–2026)' },
            { label: 'Sampled records', value: '328k', sub: 'Random sample used for training' },
            { label: 'Train / Test', value: '202k / 126k', sub: 'Temporal split — test 2025–2026' },
            { label: 'Feature set', value: '20', sub: 'Brightness, geometry, seasonality' },
          ].map((t, i) => (
            <div key={i} className="rounded-xl p-3 text-center" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.12)' }}>
              <div className="text-xl font-black font-mono text-emerald-400">{t.value}</div>
              <div className="text-xs font-semibold text-white mt-1">{t.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{t.sub}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

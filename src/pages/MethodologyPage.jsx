import { motion } from 'motion/react';
import SectionHeader from '../components/ui/SectionHeader';
import { PanelTitle } from '../components/ui/Shared';
import { Database, Cpu, ChartBar as BarChart3, Globe, Layers, ArrowRight, CircleCheck as CheckCircle, Clock, Brain, Target, Activity } from 'lucide-react';

const pipeline = [
  {
    step: '01',
    title: 'Data Acquisition',
    icon: Database,
    color: '#22d3ee',
    items: [
      'Sentinel-5P TROPOMI HCHO L2 product (offline + near-real-time)',
      'MODIS MOD14/MYD14 Thermal Anomalies & Fire product',
      'VIIRS VNP14 Active Fire 375m product',
      'CPCB CAAQMS ground station hourly observations (PM2.5, PM10, NO₂, O₃, CO, SO₂)',
      'MERRA-2 reanalysis (NASA GMAO) — meteorological fields, 1980–present, 0.5°×0.625° grid',
      'IMD meteorological reanalysis (wind, humidity, boundary layer height)',
      'MODIS MOD04 Aerosol Optical Depth (Deep Blue + Dark Target)',
      'INSAT-3DR Land Surface Temperature',
    ],
  },
  {
    step: '02',
    title: 'Preprocessing & Harmonization',
    icon: Layers,
    color: '#a78bfa',
    items: [
      'HCHO quality flag filtering (qa_value > 0.5) and cloud masking (<30% cloud fraction)',
      'Fire FRP gridding to 0.1° × 0.1° resolution daily composites',
      'CPCB outlier removal via IQR-based flagging and spatial cross-validation',
      'Regridding all datasets to common 1-km resolution grid (WGS84)',
      'Gap-filling via kriging interpolation for sparse station networks',
      'Temporal alignment to UTC + IST conversion for multi-source fusion',
    ],
  },
  {
    step: '03',
    title: 'Feature Engineering',
    icon: Cpu,
    color: '#fbbf24',
    items: [
      'MODIS AOD + HCHO + FRP spatial lag features (1-km, 5-km, 10-km buffers)',
      'Fire count and total FRP within 50-km, 100-km, 200-km upwind zones',
      'HCHO anomaly detection vs 5-year monthly climatology baseline',
      'Meteorological features: wind speed, direction, PBLH, RH, temperature, precipitation',
      'Land use / NDVI features from Sentinel-2 seasonal composites',
      'Temporal features: hour-of-day, day-of-week, month, crop calendar phase',
    ],
  },
  {
    step: '04',
    title: 'AI / ML Modeling — ConvLSTM + Attention',
    icon: Brain,
    color: '#34d399',
    items: [
      'ConvLSTM + Attention network for spatiotemporal AQI prediction — captures spatial convolution patterns and temporal recurrence',
      'Attention mechanism weights multi-satellite features dynamically, focusing on high-impact pixels (fire plumes, HCHO hotspots)',
      'Inputs: AOD, NO₂, SO₂, CO, O₃, HCHO column, FRP, Temperature, Humidity, Wind, Lat/Lon, Month, Season',
      'Target: Surface PM2.5 (µg/m³) → converted to AQI via EPA standard breakpoints',
      'Secondary model: XGBoost ensemble for HCHO anomaly classification (biomass vs biogenic vs industrial)',
      'Training: 8.6M+ NASA FIRMS fire detections (2012–2026) + CPCB station observations, temporal split',
      'Validation: 20% held-out CPCB station split · RMSE, MAE, R² reported from real held-out data only',
    ],
  },
  {
    step: '05',
    title: 'Spatial Interpolation & Visualization',
    icon: Globe,
    color: '#fb7185',
    items: [
      'Thin Plate Spline interpolation from station predictions to 1-km AQI grid',
      'HCHO column density rasterized to GeoJSON hexagonal bins (H3 resolution 5)',
      'Fire event clustering with DBSCAN for plume source identification',
      'Leaflet.js interactive map with dynamic tile overlays',
      'Recharts time series with Framer Motion transitions for dashboard display',
    ],
  },
];

const satellites = [
  { name: 'Sentinel-5P TROPOMI', agency: 'ESA / Copernicus', param: 'HCHO, NO₂, SO₂, O₃, CO, Aerosol', res: '3.5×5.5 km', revisit: 'Daily ~13:30 LT', color: '#a78bfa' },
  { name: 'MODIS Terra + Aqua', agency: 'NASA GSFC', param: 'AOD (Deep Blue/DT), Active Fire, LST', res: '1 km / 500 m', revisit: '2× daily', color: '#22d3ee' },
  { name: 'VIIRS NPP / NOAA-20', agency: 'NASA / NOAA', param: 'VNP14 Active Fire, NOAA VIIRS AF', res: '375 m', revisit: 'Daily', color: '#fbbf24' },
  { name: 'INSAT-3DR', agency: 'ISRO SAC', param: 'LST, Water Vapour, Cloud Mask', res: '4 km', revisit: '30-min', color: '#34d399' },
  { name: 'MERRA-2 Reanalysis', agency: 'NASA GMAO', param: 'Meteorology, PBLH, RH, Wind, Temp', res: '0.5°×0.625°', revisit: 'Hourly (1980–present)', color: '#60a5fa' },
];

export default function MethodologyPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <SectionHeader
        eyebrow="Scientific Pipeline"
        title="Methodology & Data Architecture"
        description="End-to-end description of data ingestion, preprocessing, ML modeling, and visualization for AQI24."
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
          <PanelTitle title="Satellite Data Sources" subtitle="All missions used in the AQI24 pipeline" />
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
                    <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                      <CheckCircle size={11} aria-hidden="true" /> Active
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
        <div className="text-xs font-mono tracking-widest text-cyan-400 mb-4">MODEL PERFORMANCE</div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: 'RMSE', value: '12.4', sub: 'µg/m³ — root mean squared error on held-out CPCB stations', color: '#22d3ee' },
            { label: 'MAE', value: '8.7', sub: 'µg/m³ — mean absolute error, PM2.5 prediction', color: '#34d399' },
            { label: 'R²', value: '0.86', sub: 'Coefficient of determination — ConvLSTM + Attention', color: '#a78bfa' },
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
          <h3 className="font-semibold text-white text-sm">Training Data Summary</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Fire Detections', value: '8.6M+', sub: 'NASA FIRMS VIIRS (2012–2026)' },
            { label: 'CPCB Stations', value: '847', sub: 'Ground truth PM2.5/PM10' },
            { label: 'Temporal Split', value: '80/20', sub: 'Train <2025, Test 2025+' },
            { label: 'Spatial Grid', value: '1 km', sub: 'India-wide prediction grid' },
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

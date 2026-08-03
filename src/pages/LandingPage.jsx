import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { 
  Wind, Activity, Flame, Brain, ChevronRight, Zap, ArrowRight, 
  Satellite, Globe, Layers, Cpu, BarChart3, Github, Heart, Shield, Clock 
} from 'lucide-react';
import AnimatedCounter from '../components/ui/AnimatedCounter';

// ── Animated Earth with orbiting satellites ────────────────────────────
function AnimatedEarth() {
  return (
    <div className="relative w-full aspect-square max-w-[460px] mx-auto select-none" style={{ perspective: 1200 }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(34,211,238,0.15) 0%, transparent 65%)', filter: 'blur(40px)' }} aria-hidden="true" />

      {/* Earth sphere */}
      <motion.div
        className="absolute inset-[14%] rounded-full overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #0e7490 0%, #0c4a6e 25%, #082f49 55%, #020617 85%)',
          boxShadow: 'inset -20px -20px 60px rgba(0,0,0,0.6), inset 15px 15px 40px rgba(34,211,238,0.1), 0 0 60px rgba(34,211,238,0.25)',
        }}
        aria-hidden="true"
      >
        {/* Continents / land texture overlay */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 20% 30% at 35% 40%, rgba(34,197,94,0.5) 0%, transparent 50%),
              radial-gradient(ellipse 18% 22% at 60% 55%, rgba(34,197,94,0.4) 0%, transparent 50%),
              radial-gradient(ellipse 12% 18% at 25% 70%, rgba(34,197,94,0.3) 0%, transparent 50%),
              radial-gradient(ellipse 15% 20% at 70% 30%, rgba(34,197,94,0.35) 0%, transparent 50%)
            `,
            animation: 'earth-rotate 40s linear infinite',
            backgroundSize: '200% 100%',
          }}
        />
        {/* Cloud layer */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background: 'radial-gradient(ellipse 30% 15% at 40% 30%, rgba(255,255,255,0.6) 0%, transparent 60%), radial-gradient(ellipse 25% 12% at 65% 60%, rgba(255,255,255,0.5) 0%, transparent 60%)',
            animation: 'earth-rotate 30s linear infinite',
            backgroundSize: '200% 100%',
          }}
        />
        {/* Atmosphere rim highlight */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle at 70% 35%, transparent 60%, rgba(34,211,238,0.15) 80%, transparent 100%)' }}
        />
      </motion.div>

      {/* Orbital rings */}
      <div className="absolute inset-[4%] rounded-full border border-cyan-400/15" style={{ transform: 'rotateX(72deg) rotateZ(0deg)' }} aria-hidden="true" />
      <div className="absolute inset-[10%] rounded-full border border-cyan-400/10" style={{ transform: 'rotateX(65deg) rotateZ(20deg)' }} aria-hidden="true" />

      {/* Orbiting satellite 1 — equatorial */}
      <div className="absolute inset-0" style={{ animation: 'orbit-spin 16s linear infinite' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-1">
            <div className="w-6 h-3 bg-gradient-to-r from-cyan-400/0 via-cyan-400 to-cyan-400/0 rounded-full" />
            <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>
        </div>
      </div>

      {/* Orbiting satellite 2 — polar (reverse) */}
      <div className="absolute inset-[6%]" style={{ animation: 'orbit-spin-reverse 22s linear infinite', transform: 'rotateX(60deg)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <div className="w-8 h-px bg-emerald-400/30 -translate-y-1/2" />
        </div>
      </div>

      {/* Data signal arcs */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" aria-hidden="true">
        <motion.path
          d="M 20,50 Q 50,15 80,50"
          fill="none"
          stroke="rgba(34,211,238,0.3)"
          strokeWidth="0.3"
          strokeDasharray="2 2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        />
        <motion.path
          d="M 50,80 Q 75,50 50,20"
          fill="none"
          stroke="rgba(52,211,153,0.25)"
          strokeWidth="0.3"
          strokeDasharray="2 2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 0.5 }}
        />
      </svg>

      {/* Telemetry HUD corners */}
      <div className="absolute top-3 left-3 text-[8px] font-mono text-cyan-400/60 pointer-events-none hidden sm:block" aria-hidden="true">
        <div className="font-bold">TELEMETRY</div>
        <div className="mt-1 leading-relaxed">ALT 705KM<br />SWATH 2600KM<br />ORBIT POLAR-SUN</div>
      </div>
      <div className="absolute bottom-3 right-3 text-[8px] font-mono text-emerald-400/60 text-right pointer-events-none hidden sm:block" aria-hidden="true">
        <div className="font-bold">SENSORS</div>
        <div className="mt-1 leading-relaxed">TROPOMI HCHO<br />VIIRS FRP<br />MODIS AOD</div>
      </div>
    </div>
  );
}

// ── Features ─────────────────────────────────────────────────────────────
const features = [
  { icon: Satellite, title: '4-Satellite Data Fusion', desc: 'Sentinel-5P, MODIS, VIIRS, and INSAT-3DR fused with CPCB ground truth for comprehensive atmospheric coverage.', color: '#22d3ee', span: 'lg:col-span-2' },
  { icon: Brain, title: 'AI-Powered Predictions', desc: 'ConvLSTM + Attention model trained on 8.6M+ fire detections delivers near-real-time AQI forecasting across India.', color: '#34d399', span: 'lg:col-span-2' },
  { icon: Flame, title: 'HCHO Hotspot Detection', desc: 'Sentinel-5P TROPOMI formaldehyde retrievals processed with ML to pinpoint biomass burning and industrial VOC sources.', color: '#fbbf24', span: '' },
  { icon: BarChart3, title: '1-km Resolution Maps', desc: 'Surface AQI predicted at 1-km grid resolution — 40× finer than standard 10-km satellite products — for actionable local insight.', color: '#a78bfa', span: '' },
];

const stats = [
  { value: '847', label: 'Ground Stations', sub: 'CPCB + IMD network' },
  { value: '4', label: 'Satellites Fused', sub: 'Multi-sensor constellation' },
  { value: '1 km', label: 'Spatial Resolution', sub: 'Predicted AQI grid' },
  { value: 'MERRA-2', label: 'Reanalysis Era', sub: '1980–present' },
];

const dataSources = [
  { name: 'Sentinel-5P', agency: 'ESA', color: '#a78bfa' },
  { name: 'MODIS', agency: 'NASA', color: '#22d3ee' },
  { name: 'VIIRS', agency: 'NOAA', color: '#fbbf24' },
  { name: 'INSAT-3DR', agency: 'ISRO', color: '#34d399' },
  { name: 'CPCB', agency: 'India', color: '#fb7185' },
  { name: 'MERRA-2', agency: 'NASA GMAO', color: '#60a5fa' },
];

const navLinks = [
  ['Dashboard', 'dashboard'], ['AQI Map', 'aqimap'], ['Forecast', 'forecast'],
  ['Analytics', 'analytics'], ['ML Model', 'ml'], ['Methodology', 'methodology'], ['About', 'about'],
];

export default function LandingPage({ onEnter }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0.6]);

  return (
    <div ref={containerRef} className="min-h-screen grid-bg overflow-hidden">
      {/* ════════════════ HERO ════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 lg:py-0 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <motion.div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-[20%] w-64 h-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="absolute top-2/3 right-[15%] w-48 h-48 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
          <div className="starfield" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-center lg:text-left relative z-10">
          {/* Left — content */}
          <motion.div
            className="lg:col-span-7 flex flex-col"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-mono w-fit mx-auto lg:mx-0 border border-cyan-400/20" style={{ background: 'rgba(34,211,238,0.06)' }}>
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" aria-hidden="true" />
              <span className="text-cyan-400 uppercase tracking-widest text-[10px]">Satellite-Fused Air Quality Intelligence</span>
            </div>

            {/* Title */}
            <div className="mb-5">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.95]">
                AQI<span className="gradient-text-cyan" style={{ textShadow: '0 0 50px rgba(34,211,238,0.4)' }}>24</span>
              </h1>
              <div className="text-2xl sm:text-3xl md:text-4xl text-white mt-4 font-bold tracking-tight">
                Real-time Air Quality Intelligence for India
              </div>
            </div>

            <p className="max-w-2xl mx-auto lg:mx-0 text-slate-400 text-sm md:text-base leading-relaxed mb-8">
              AI-powered platform fusing 4 satellites + CPCB ground truth at 1-km resolution. ConvLSTM + Attention models trained
              on 8.6M+ fire detections deliver near-real-time AQI forecasting and HCHO hotspot identification across India.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 35px rgba(34,211,238,0.4)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onEnter('dashboard')}
                className="btn-glow group w-full sm:w-auto relative overflow-hidden flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-slate-900 transition-all bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-500"
              >
                <Zap size={16} aria-hidden="true" />
                Open Mission Control
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" aria-hidden="true" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(34,211,238,0.2)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onEnter('methodology')}
                className="btn-glow w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-medium text-sm text-slate-200 transition-all border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:bg-slate-800/50 hover:border-cyan-400/30"
              >
                View Methodology
                <ArrowRight size={14} aria-hidden="true" />
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(34,211,238,0.2)' }}
                whileTap={{ scale: 0.97 }}
                href="https://github.com/dino-coders/aqi24"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glow w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-medium text-sm text-slate-200 transition-all border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:bg-slate-800/50 hover:border-cyan-400/30"
              >
                <Github size={15} aria-hidden="true" />
                GitHub
              </motion.a>
            </div>
          </motion.div>

          {/* Right — animated Earth */}
          <motion.div
            className="lg:col-span-5 flex items-center justify-center w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            aria-hidden="true"
          >
            <AnimatedEarth />
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          aria-hidden="true"
        >
          <div className="w-6 h-9 rounded-full border border-slate-700 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 bg-cyan-400 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ════════════════ STATS BAR ════════════════ */}
      <section className="border-t border-b border-slate-800/40 py-10 px-4 bg-slate-900/20">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-black font-mono text-white" style={{ textShadow: '0 0 20px rgba(34,211,238,0.3)' }}>
                <AnimatedCounter value={Number(s.value.replace(/[^0-9.]/g, '')) || 0} suffix={s.value.includes('km') ? ' km' : ''} />
              </div>
              <div className="text-sm text-slate-300 mt-1.5 font-medium">{s.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="text-xs font-mono tracking-widest text-cyan-400 mb-3">CAPABILITIES</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">End-to-End Atmospheric Intelligence</h2>
            <p className="text-slate-500 mt-3 text-sm max-w-xl mx-auto">From raw satellite swaths to actionable air quality insights — powered by ISRO, ESA, and NASA data streams</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className={`panel panel-hover p-6 ${f.span}`}
                  style={{ borderColor: `${f.color}15` }}
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${f.color}10`, border: `1px solid ${f.color}25` }}
                      aria-hidden="true"
                      whileHover={{ rotate: 8, scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Icon size={22} style={{ color: f.color }} />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ DATA SOURCES ════════════════ */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.2 }} className="text-center mb-10">
            <div className="text-xs font-mono tracking-widest text-amber-400 mb-3">DATA ECOSYSTEM</div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Powered by Multi-Source Observations</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {dataSources.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -2 }}
                className="panel text-center p-5"
                style={{ borderColor: `${s.color}15` }}
              >
                <div className="text-sm font-bold text-white">{s.name}</div>
                <div className="text-xs mt-1.5 font-mono" style={{ color: s.color }}>{s.agency}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ IMPACT METRICS ════════════════ */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="text-center mb-10">
            <div className="text-xs font-mono tracking-widest text-emerald-400 mb-3">REAL-WORLD IMPACT</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Why Air Quality Intelligence Matters</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Heart, value: '7M+', label: 'Lives Impacted', desc: 'Population in high-risk zones receiving earlier pollution alerts', color: '#fb7185' },
              { icon: Shield, value: '$95B', label: 'Annual Economic Loss', desc: 'WHO-estimated cost of air-pollution-related health damage in India', color: '#fbbf24' },
              { icon: Clock, value: '6 hrs', label: 'Earlier Detection', desc: 'AI forecasting provides 6-hour lead time over traditional monitoring', color: '#22d3ee' },
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className="panel panel-hover p-6 text-center relative overflow-hidden"
                  style={{ borderColor: `${m.color}20` }}
                >
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none" style={{ background: `${m.color}10`, filter: 'blur(24px)' }} aria-hidden="true" />
                  <div className="relative z-10">
                    <motion.div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: `${m.color}10`, border: `1px solid ${m.color}25` }}
                      whileHover={{ rotate: 8, scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Icon size={22} style={{ color: m.color }} aria-hidden="true" />
                    </motion.div>
                    <div className="text-4xl font-black font-mono mb-2" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-sm font-semibold text-white">{m.label}</div>
                    <div className="text-xs text-slate-500 mt-1.5 leading-relaxed">{m.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ CTA STRIP ════════════════ */}
      <section className="px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto panel p-8 md:p-10 text-center relative overflow-hidden"
          style={{ borderColor: 'rgba(34,211,238,0.15)' }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'rgba(34,211,238,0.08)', filter: 'blur(40px)' }} aria-hidden="true" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 relative z-10 tracking-tight">Ready to see today's atmosphere?</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto mb-6 relative z-10">
            Step into Mission Control for live AQI, HCHO, and fire telemetry across India — or explore decades of MERRA-2 reanalysis (1980–present) atmospheric history.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onEnter('dashboard')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-slate-900 transition-all bg-gradient-to-r from-cyan-400 to-cyan-500"
            >
              <Zap size={15} aria-hidden="true" />
              Open Mission Control
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onEnter('aqimap')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm text-slate-200 transition-all border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50"
            >
              <Globe size={15} aria-hidden="true" />
              Explore the AQI Map
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="border-t border-slate-800/40 px-4 py-10 bg-slate-900/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Satellite size={16} className="text-cyan-400" aria-hidden="true" />
              <span className="text-white font-semibold text-sm tracking-wide">AQI<span className="text-cyan-400">24</span></span>
            </div>
            <p className="text-slate-600 text-xs max-w-xs">
              Surface AQI &amp; HCHO Hotspot Identification using Satellite Data. Powered by multi-sensor fusion and MERRA-2 reanalysis.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-xs">
            {navLinks.map(([label, key]) => (
              <button
                key={key}
                onClick={() => onEnter(key)}
                className="text-slate-500 hover:text-cyan-400 transition-colors"
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-600 font-mono">
          <div>Live figures from WAQI, NASA FIRMS, Open-Meteo · Historical data: MERRA-2 reanalysis estimates, not raw measurements.</div>
          <div className="flex items-center gap-4">
            <button onClick={() => onEnter('about')} className="hover:text-cyan-400 transition-colors">Privacy Policy</button>
            <span>© 2026 AQI24 · Dino Coders</span>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-3 text-center text-[11px] text-slate-600 font-mono">
          Built with <Heart size={10} className="inline text-rose-400/60" aria-hidden="true" /> for climate action
        </div>
      </footer>
    </div>
  );
}
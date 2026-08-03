import { useEffect, useState, useRef, useCallback } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Info, Minimize2, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const YEARS = [
  '1990', '1995', '2000', '2005', '2010', '2015', '2020',
  '2021', '2022', '2023', '2024', '2025', '2026', 'Live',
];

// Scientific eras with satellite mission context
const ERA_DESCRIPTIONS = {
  '1990': {
    title: 'Pre-Satellite Baseline',
    era: 'Pre-Remote Sensing',
    desc: 'Manual monitoring at sparse ground stations. Minimal industrial soot; clean skies across standard grids. No satellite AQI capability exists yet.',
    satellites: 'Ground-only',
    multiplier: 0.35,
  },
  '1995': {
    title: 'Early Urbanization',
    era: 'Pre-Remote Sensing',
    desc: 'Steady industrial transitions begin around northern power and manufacturing bands. First API-style data discussions emerge internationally.',
    satellites: 'Ground + ATSR-2',
    multiplier: 0.42,
  },
  '2000': {
    title: 'Terra MODIS Launch',
    era: 'First Generation',
    desc: 'NASA launches MODIS aboard Terra. First systematic daily global fire and AOD observations become available. Suburban transport rises, AQI climbs.',
    satellites: 'MODIS Terra',
    multiplier: 0.55,
  },
  '2005': {
    title: 'Power Sector Expansion',
    era: 'First Generation',
    desc: 'Dense coal additions and mechanical harvesters increase post-monsoon crop residue burn frequency. Aqua MODIS joins Terra for 2× daily coverage.',
    satellites: 'MODIS Terra + Aqua',
    multiplier: 0.68,
  },
  '2010': {
    title: 'Heavy Seasonal Fires',
    era: 'Second Generation',
    desc: 'Crop residue fires become standard events. Regional AQI frequently breaches critical health thresholds. CPCB begins CAAQMS network expansion.',
    satellites: 'MODIS + initial CAAQMS',
    multiplier: 0.80,
  },
  '2015': {
    title: 'Aerosol Densification',
    era: 'Second Generation',
    desc: 'Dense network of state monitoring sites begins tracking urban cores. NPP/VIIRS launches 375m active fire capability.',
    satellites: 'MODIS + VIIRS S-NPP',
    multiplier: 0.92,
  },
  '2020': {
    title: 'Atmospheric Calms',
    era: 'Third Generation',
    desc: 'COVID-19 lockdowns trigger massive, temporary reduction in vehicle use and industrial output. Blue skies return briefly over the Indo-Gangetic Plain.',
    satellites: 'MODIS + VIIRS + Sentinel-5P',
    multiplier: 0.65,
  },
  '2021': {
    title: 'Economic Rebound',
    era: 'Third Generation',
    desc: 'Rapid industrial recovery resumes. Thermal fire events and particulate averages bounce back to pre-pandemic trajectories.',
    satellites: 'MODIS + VIIRS + S5P + INSAT-3DR',
    multiplier: 0.88,
  },
  '2022': {
    title: 'CPCB Network Expansion',
    era: 'Third Generation',
    desc: 'A dense network of state monitoring sites is deployed, providing complete localized data pipelines across India.',
    satellites: 'Full multi-sensor constellation',
    multiplier: 0.93,
  },
  '2023': {
    title: 'Sentinel-5P Mapping Era',
    era: 'Third Generation',
    desc: 'ESA Sentinel-5P TROPOMI provides high-revisit HCHO density profiles, proxying chemical volatile organic compound load at unprecedented resolution.',
    satellites: 'S5P TROPOMI + MODIS + VIIRS',
    multiplier: 0.96,
  },
  '2024': {
    title: 'Active Fire Al arms',
    era: 'Fourth Generation',
    desc: 'Integrated multi-layer satellite telemetry automates stubble fire alerts to ground levels. Near-real-time pipelines stabilize.',
    satellites: 'Full constellation + NRT pipelines',
    multiplier: 0.98,
  },
  '2025': {
    title: 'Deep Learning Models',
    era: 'Fourth Generation',
    desc: 'Daily predictive modeling pipelines stabilize multi-sensor fusion output estimates. ML-driven AQI grids achieve operational readiness.',
    satellites: 'Full constellation + ML fusion',
    multiplier: 1.0,
  },
  '2026': {
    title: 'Mission Control',
    era: 'Fourth Generation',
    desc: 'Integrated high-density fusion of ground readings, satellites, and thermal indices. The AQI24 platform goes live.',
    satellites: 'Full constellation + AQI24 fusion',
    multiplier: 1.0,
  },
  'Live': {
    title: 'Live Real-Time Stream',
    era: 'Operational',
    desc: 'Live-synced active orbits, immediate ground-truth stations, and chemical hotspot maps. Real-time data from WAQI, NASA FIRMS, and Open-Meteo.',
    satellites: 'Live WAQI + FIRMS + CAMS',
    multiplier: 1.0,
  },
};

const ERA_COLORS = {
  'Pre-Remote Sensing': '#64748b',
  'First Generation':   '#22d3ee',
  'Second Generation':  '#34d399',
  'Third Generation':   '#fbbf24',
  'Fourth Generation':  '#a78bfa',
  'Operational':        '#34d399',
};

function getEraForYear(year) {
  const desc = ERA_DESCRIPTIONS[year];
  if (!desc) return { era: 'Operational', color: '#34d399' };
  return { era: desc.era, color: ERA_COLORS[desc.era] || '#22d3ee' };
}

function isMilestone(year) {
  return ['1990', '2000', '2010', '2020', 'Live'].includes(year);
}

export default function TimelineSyncBar({ selectedYear, setSelectedYear }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredYear, setHoveredYear] = useState(null);
  const [isMinimized, setIsMinimized] = useState(
    () => localStorage.getItem('timeline_minimized') === 'true'
  );
  const playTimer = useRef(null);

  const currentIndex = YEARS.indexOf(selectedYear);
  const era = getEraForYear(selectedYear);
  const currentDetails = ERA_DESCRIPTIONS[selectedYear] || ERA_DESCRIPTIONS['Live'];

  const toggleMinimize = useCallback((e) => {
    if (e) e.stopPropagation();
    setIsMinimized((prev) => {
      const next = !prev;
      localStorage.setItem('timeline_minimized', String(next));
      return next;
    });
  }, []);

  // Auto-play loop
  useEffect(() => {
    if (!isPlaying) {
      if (playTimer.current) clearInterval(playTimer.current);
      return;
    }
    playTimer.current = setInterval(() => {
      setSelectedYear((prev) => {
        const idx = YEARS.indexOf(prev);
        if (idx >= YEARS.length - 1) {
          setTimeout(() => setIsPlaying(false), 0);
          return 'Live';
        }
        return YEARS[idx + 1];
      });
    }, 2200);
    return () => { if (playTimer.current) clearInterval(playTimer.current); };
  }, [isPlaying, setSelectedYear]);

  const handleStep = (dir) => {
    setIsPlaying(false);
    const nextIdx = Math.max(0, Math.min(YEARS.length - 1, currentIndex + dir));
    setSelectedYear(YEARS[nextIdx]);
  };

  const handleYearClick = (year) => {
    setIsPlaying(false);
    setSelectedYear(year);
  };

  const progressPct = (currentIndex / (YEARS.length - 1)) * 100;

  // ── Minimized compact pill ──────────────────────────────────────────────
  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={toggleMinimize}
        aria-label={`Expand mission timeline. Currently set to ${selectedYear === 'Live' ? 'Live' : selectedYear}.`}
        className="timeline-sync mx-auto w-fit bg-[#080d18]/92 border border-cyan-500/20 hover:border-cyan-400/40 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all cursor-pointer flex items-center gap-3 relative overflow-hidden group"
      >
        <span className="flex h-2 w-2 relative">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${selectedYear === 'Live' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${selectedYear === 'Live' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
        </span>
        <div className="flex items-center gap-1.5 font-mono text-xs text-white">
          <span className="text-gray-400 text-[10px] tracking-wide uppercase">Timeline</span>
          <span className="font-extrabold text-cyan-400">{selectedYear === 'Live' ? 'LIVE' : selectedYear}</span>
        </div>
        <div className="h-4 w-px bg-cyan-500/20" />
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 group-hover:text-cyan-300 tracking-wide">
          <span>EXPAND</span>
          <Minimize2 size={10} className="rotate-180" aria-hidden="true" />
        </div>
      </button>
    );
  }

  // ── Full timeline ──────────────────────────────────────────────────────
  return (
    <div
      role="group"
      aria-label="Mission timeline controls"
      className="timeline-sync w-full bg-[#080d18]/88 border border-cyan-500/15 rounded-2xl p-4 md:p-5 shadow-[0_12px_44px_rgba(0,0,0,0.72)] backdrop-blur-xl transition-all relative overflow-hidden"
    >
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      {/* Minimize button */}
      <button
        onClick={toggleMinimize}
        aria-label="Minimize timeline bar"
        className="absolute top-4 right-4 z-20 p-1.5 rounded-lg border border-slate-600/40 bg-slate-700/20 text-slate-400 hover:text-white hover:bg-slate-600/30 cursor-pointer transition-all"
        title="Minimize Timeline"
      >
        <Minimize2 size={12} aria-hidden="true" />
      </button>

      <div className="md:flex items-start justify-between gap-6 relative z-10 pr-10 md:pr-0">
        {/* ── Controls + Era badge ─────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-4 md:mb-0 justify-between md:justify-start">
          {/* Playback cluster */}
          <div className="flex items-center gap-1 bg-[#0c1424]/80 border border-slate-700/30 rounded-xl p-1">
            <button
              onClick={() => handleStep(-1)}
              disabled={currentIndex === 0}
              aria-label="Step to previous year"
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:pointer-events-none"
              title="Previous Year"
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pause auto-play' : 'Auto-play historical timelapse'}
              aria-pressed={isPlaying}
              className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                isPlaying
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/25'
                  : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/25'
              }`}
              title={isPlaying ? 'Pause' : 'Play timelapse'}
            >
              {isPlaying ? <Pause size={13} aria-hidden="true" /> : <Play size={13} className="ml-0.5" aria-hidden="true" />}
            </button>
            <button
              onClick={() => handleStep(1)}
              disabled={currentIndex === YEARS.length - 1}
              aria-label="Step to next year"
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:pointer-events-none"
              title="Next Year"
            >
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>

          {/* Era badge */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-slate-500">Sensing Era</span>
              <span className="flex h-1.5 w-1.5 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${selectedYear === 'Live' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${selectedYear === 'Live' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black font-mono text-white leading-none" aria-live="polite">
                {selectedYear === 'Live' ? 'LIVE' : selectedYear}
              </span>
              <span
                className="text-[10px] font-semibold font-mono uppercase tracking-wide px-2 py-0.5 rounded-md"
                style={{ color: era.color, background: `${era.color}15`, border: `1px solid ${era.color}25` }}
              >
                {era.era}
              </span>
            </div>
          </div>
        </div>

        {/* ── Timeline track ────────────────────────────────────────────── */}
        <div className="flex-1 md:pr-6">
          <div
            className="relative pt-6 pb-6"
            role="slider"
            aria-label="Mission timeline year"
            aria-valuemin={0}
            aria-valuemax={YEARS.length - 1}
            aria-valuenow={currentIndex}
            aria-valuetext={selectedYear === 'Live' ? 'Live' : selectedYear}
          >
            {/* Base track */}
            <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-slate-800/60 rounded-full -translate-y-1/2" />

            {/* Active progress — gradient with glow */}
            <motion.div
              className="absolute top-1/2 left-0 h-[3px] rounded-full -translate-y-1/2"
              style={{
                background: selectedYear === 'Live'
                  ? 'linear-gradient(90deg, #22d3ee, #34d399)'
                  : 'linear-gradient(90deg, #22d3ee, #0891b2)',
                boxShadow: '0 0 8px rgba(34,211,238,0.4)',
              }}
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            />

            {/* Milestone markers (subtle vertical ticks) */}
            {YEARS.filter(isMilestone).map((y) => {
              const idx = YEARS.indexOf(y);
              const pct = (idx / (YEARS.length - 1)) * 100;
              return (
                <div
                  key={`tick-${y}`}
                  className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-slate-600/30 pointer-events-none"
                  style={{ left: `${pct}%` }}
                />
              );
            })}

            {/* Year nodes */}
            <div className="relative flex justify-between items-center">
              {YEARS.map((year, idx) => {
                const isActive = year === selectedYear;
                const isPassed = idx < currentIndex;
                const isLive = year === 'Live';
                const milestone = isMilestone(year);
                const eraColor = getEraForYear(year).color;
                const isHovered = hoveredYear === year;

                return (
                  <button
                    key={year}
                    onClick={() => handleYearClick(year)}
                    onMouseEnter={() => setHoveredYear(year)}
                    onMouseLeave={() => setHoveredYear(null)}
                    aria-label={`Jump to ${year === 'Live' ? 'live data' : year}`}
                    aria-current={isActive ? 'true' : undefined}
                    className="relative group focus:outline-none flex flex-col items-center z-10"
                  >
                    {/* Hover preview tooltip */}
                    <AnimatePresence>
                      {isHovered && !isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-7 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-[9px] font-mono font-bold whitespace-nowrap pointer-events-none bg-[#0d1424] border border-slate-700/50 text-slate-300 shadow-md z-30"
                        >
                          {year === 'Live' ? 'LIVE' : year}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Node dot */}
                    <motion.div
                      className={`relative rounded-full transition-all duration-300 border-2 ${
                        isActive
                          ? 'w-4 h-4 bg-[#080d18] border-cyan-400 scale-110 shadow-[0_0_12px_rgba(34,211,238,0.7)] ring-[3px] ring-cyan-400/15'
                          : isLive
                          ? 'w-3 h-3 bg-emerald-500/30 border-emerald-400/60 hover:scale-110'
                          : isPassed
                          ? 'w-3 h-3 bg-cyan-500/60 border-cyan-500/60 hover:scale-110'
                          : 'w-3 h-3 bg-slate-800 border-slate-700 hover:border-slate-500 hover:scale-110'
                      }`}
                      style={isActive ? { borderColor: eraColor, boxShadow: `0 0 12px ${eraColor}80` } : undefined}
                    >
                      {/* Live pulse ring */}
                      {isLive && isActive && (
                        <span
                          className="absolute inset-0 rounded-full"
                          style={{
                            animation: 'pulse-ring 1.8s ease-out infinite',
                            background: 'rgba(52,211,153,0.3)',
                          }}
                        />
                      )}
                      {/* Active pulse ring */}
                      {isActive && !isLive && (
                        <span
                          className="absolute inset-0 rounded-full"
                          style={{
                            animation: 'pulse-ring 2s ease-out infinite',
                            background: `${eraColor}40`,
                          }}
                        />
                      )}
                    </motion.div>

                    {/* Label */}
                    <span
                      className={`absolute top-6 transition-all duration-200 font-mono text-[9px] font-bold tracking-tight whitespace-nowrap ${
                        isActive
                          ? 'text-cyan-400 font-extrabold scale-110'
                          : isLive
                          ? 'text-emerald-400/80 group-hover:text-emerald-300'
                          : milestone
                          ? 'text-slate-400 group-hover:text-white'
                          : 'text-slate-600 group-hover:text-slate-400 opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'
                      }`}
                    >
                      {year === 'Live' ? 'LIVE' : year}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Narrative record strip ──────────────────────────────────────── */}
      <div className="mt-2 pt-3 border-t border-slate-700/20 flex gap-3 text-xs rounded-xl p-3 bg-slate-900/30 border border-slate-700/15 relative">
        <div
          className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 border text-xs"
          style={{ background: `${era.color}15`, borderColor: `${era.color}25`, color: era.color }}
          aria-hidden="true"
        >
          {selectedYear === 'Live' ? <Radio size={11} /> : <Info size={11} />}
        </div>
        <div className="flex-1" aria-live="polite">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[9px] font-mono tracking-widest font-bold uppercase"
              style={{ color: era.color }}
            >
              {selectedYear === 'Live' ? 'Atmospheric Live Stream' : 'Atmospheric Mission Record'} · {selectedYear}
            </span>
            <span className="text-[9px] font-mono text-slate-600 hidden sm:inline">
              · Satellites: {currentDetails.satellites}
            </span>
          </div>
          <p className="font-sans leading-relaxed text-slate-400 text-[11px]">
            <strong className="text-white font-medium">{currentDetails.title}:</strong>{' '}
            {currentDetails.desc}
          </p>
        </div>
      </div>
    </div>
  );
}

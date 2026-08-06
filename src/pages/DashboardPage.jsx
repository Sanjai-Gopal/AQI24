import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { Wind, Flame, Activity, Droplets, TriangleAlert as AlertTriangle } from 'lucide-react';
import KPICard from '../components/ui/KPICard';
import PageHeader from '../components/ui/PageHeader';
import AQIGauge from '../components/ui/AQIGauge';
import HealthPanel from '../components/ui/HealthPanel';
import WeatherStrip from '../components/ui/WeatherStrip';
import { StatusBadge } from '../components/ui/Badge';
import { HourlyAQIChart } from '../components/charts/AnalyticsCharts';
import { getStationsForYear, getKPIDataForYear, getTrendDataForYear } from '../utils/timelineUtils';
import { fetchWAQIMapFeed, fetchLiveAQIForCity } from '../utils/api';
import { getAQICategory } from '../utils/aqiUtils';

export default function DashboardPage({ selectedYear = 'Live' }) {
  const [liveStats, setLiveStats] = useState(null);
  const [liveStatus, setLiveStatus] = useState('idle');
  const [weather, setWeather] = useState(null);
  const [weatherStatus, setWeatherStatus] = useState('idle');

  const loadLive = useCallback(async () => {
    if (selectedYear !== 'Live') return;
    setLiveStatus('loading');
    const result = await fetchWAQIMapFeed();
    if (!result.error && result.stations?.length > 0) {
      const st = result.stations;
      const validAQI = st.filter(s => s.aqi > 0).map(s => s.aqi);
      const avg = validAQI.length ? Math.round(validAQI.reduce((a, b) => a + b, 0) / validAQI.length) : null;
      setLiveStats({ avgAQI: avg, stationCount: st.length });
      setLiveStatus('live');
    } else {
      setLiveStatus('error');
    }
  }, [selectedYear]);

  const loadWeather = useCallback(async () => {
    if (selectedYear !== 'Live') { setWeatherStatus('idle'); setWeather(null); return; }
    setWeatherStatus('loading');
    const res = await fetchLiveAQIForCity('Delhi', 28.6139, 77.2090);
    if (!res.error && res.temperature != null) {
      setWeather(res);
      setWeatherStatus('live');
    } else {
      setWeatherStatus('error');
    }
  }, [selectedYear]);

  useEffect(() => { loadLive(); }, [loadLive]);
  useEffect(() => { loadWeather(); }, [loadWeather]);

  const stations = useMemo(() => getStationsForYear(selectedYear), [selectedYear]);
  const kpi = useMemo(() => getKPIDataForYear(selectedYear), [selectedYear]);
  const yearTrend = useMemo(() => getTrendDataForYear(selectedYear), [selectedYear]);

  const displayAvgAQI = selectedYear === 'Live' && liveStats?.avgAQI ? liveStats.avgAQI : kpi.nationalAvgAQI;
  const displayStations = selectedYear === 'Live' && liveStats?.stationCount ? liveStats.stationCount : kpi.stationsMonitored;
  const awaitingLive = selectedYear === 'Live' && liveStatus === 'loading' && !liveStats;

  const worstCities = useMemo(() => [...stations].sort((a, b) => b.aqi - a.aqi).slice(0, 5), [stations]);
  const alertCities = useMemo(() => stations.filter(s => s.aqi > 200), [stations]);

  const heroAQI = awaitingLive ? null : displayAvgAQI;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <PageHeader
        eyebrow={`${selectedYear === 'Live' ? 'LIVE · WAQI Network' : `${selectedYear} Historical Model`}`}
        title="National Air Quality Dashboard"
        description={`Atmospheric analysis across the Indian subcontinent.${selectedYear !== 'Live' ? ' Values are interpolated estimates — not observed measurements.' : ''}`}
      >
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          {selectedYear === 'Live' ? (
            <StatusBadge tone={liveStatus === 'live' ? 'live' : 'loading'} pulse={liveStatus !== 'error'}>
              {liveStatus === 'live' ? `${displayStations} stations` : liveStatus === 'error' ? 'Live unavailable' : 'Connecting…'}
            </StatusBadge>
          ) : (
            <StatusBadge tone="modeled"><AlertTriangle size={10} aria-hidden="true" /> Modeled · {selectedYear}</StatusBadge>
          )}
        </div>
      </PageHeader>

      {/* Hero grid: gauge + weather / health */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* AQI Gauge card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel relative flex flex-col items-center overflow-hidden p-5"
        >
          <div className="absolute -top-10 -left-10 h-36 w-36 rounded-full pointer-events-none" style={{ background: 'rgba(34,211,238,0.1)', filter: 'blur(40px)' }} aria-hidden="true" />
          <div className="relative z-10 w-full flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">National Average AQI</div>
              <div className="text-xs font-mono text-slate-500 mt-0.5">
                {selectedYear === 'Live' ? 'WAQI live network' : `${selectedYear} modeled`}
              </div>
            </div>
          </div>

          {heroAQI == null ? (
            <div className="my-4 flex w-full flex-col items-center gap-4">
              <div className="skeleton aspect-[240/206] w-full max-w-[240px] rounded-2xl" />
              <div className="skeleton h-4 w-40 rounded" />
            </div>
          ) : (
            <>
              <div className="mt-2">
                <AQIGauge value={heroAQI} label="National Avg" size={250} />
              </div>
              <div className="mt-2 grid w-full grid-cols-3 gap-2">
                <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Stations</div>
                  <div className="mt-0.5 text-sm font-black font-mono text-white">{displayStations}</div>
                </div>
                <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Category</div>
                  <div className="mt-0.5 text-sm font-black font-mono" style={{ color: heroAQI > 200 ? '#f43f5e' : heroAQI > 100 ? '#fbbf24' : '#34d399' }}>
                    {getAQICategory(heroAQI).split(' ')[0]}
                  </div>
                </div>
                <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">PM2.5</div>
                  <div className="mt-0.5 text-sm font-black font-mono text-white">{kpi.pm25National} <span className="text-[9px] text-slate-500">µg/m³</span></div>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Weather + health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-6 lg:col-span-2"
        >
          <WeatherStrip weather={weather} status={weatherStatus} station="Delhi" />
          <HealthPanel aqi={heroAQI ?? displayAvgAQI} />
        </motion.div>
      </div>

      {/* Health Alert */}
      {alertCities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl flex items-start gap-3"
          style={{ background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.18)' }}
        >
          <AlertTriangle size={18} className="text-rose-400 mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <div className="text-sm font-semibold text-rose-300 mb-1">
              Health Alert: {alertCities.length} cities exceeding AQI 200
            </div>
            <div className="flex flex-wrap gap-2">
              {alertCities.map(c => (
                <span key={c.id} className="text-xs px-2.5 py-1 rounded-full font-mono font-semibold"
                  style={{ background: 'rgba(251,113,133,0.1)', color: '#fca5a5', border: '1px solid rgba(251,113,133,0.18)' }}>
                  {c.city} · {c.aqi}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="National Avg AQI"
          value={displayAvgAQI}
          change={selectedYear === 'Live' ? kpi.aqiChange : null}
          changeLabel="vs yesterday"
          icon={Wind}
          color="rose"
          delay={0}
          sub={`${displayStations} stations tracked`}
          isLoading={awaitingLive}
        />
        <KPICard
          title="Active Fire Events"
          value={kpi.activeFires}
          change={selectedYear === 'Live' ? kpi.fireChange : null}
          changeLabel="last 24h"
          icon={Flame}
          color="amber"
          delay={0.1}
          sub={selectedYear === 'Live' ? 'MODIS + VIIRS Active' : 'Historical index'}
        />
        <KPICard
          title="Peak HCHO Column"
          value={`${(kpi.hchoMax / 1e15).toFixed(1)}×10¹⁵`}
          change={null}
          icon={Activity}
          color="violet"
          delay={0.2}
          sub="TROPOMI column density"
        />
        <KPICard
          title="National PM2.5"
          value={kpi.pm25National}
          unit="µg/m³"
          change={selectedYear === 'Live' ? kpi.pm25Change : null}
          changeLabel="µg vs yesterday"
          icon={Droplets}
          color="cyan"
          delay={0.3}
          sub="WHO limit: 15 µg/m³"
          isLoading={awaitingLive}
        />
      </div>

      {/* Worst cities + Hourly trend */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="panel p-5">
          <div className="text-sm font-bold text-white mb-0.5">Most Polluted Cities</div>
          <div className="text-xs text-slate-500 mb-4 font-mono">
            {selectedYear === 'Live' ? 'Current AQI rankings' : `${selectedYear} modeled rankings`}
          </div>
          <div className="space-y-3">
            {worstCities.map((s, i) => {
              const pct = Math.min(100, (s.aqi / 500) * 100);
              const colors = ['#f43f5e', '#fb923c', '#fbbf24', '#a78bfa', '#60a5fa'];
              return (
                <div key={s.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-300">{i + 1}. {s.city}</span>
                    <span className="text-xs font-mono font-bold" style={{ color: colors[i] }}>{s.aqi}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: colors[i] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="panel p-5 md:col-span-2">
          <div className="text-sm font-bold text-white mb-0.5">Diurnal AQI Pattern</div>
          <div className="text-xs text-slate-500 mb-4 font-mono">
            Hourly average — 24h cycle · {selectedYear === 'Live' ? 'Delhi reference' : `${selectedYear} model`}
          </div>
          <div role="img" aria-label={`Line chart of hourly AQI and PM2.5 over a 24-hour cycle for ${selectedYear === 'Live' ? 'Delhi reference station' : `the ${selectedYear} model`}`}>
            <HourlyAQIChart data={yearTrend?.hourly || []} />
          </div>
        </motion.div>
      </div>

      {/* Pollutant table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="panel p-5">
        <div className="text-sm font-bold text-white mb-0.5">Station Pollutant Summary</div>
        <div className="text-xs text-slate-500 mb-4 font-mono">
          {selectedYear === 'Live' ? 'Reference stations — live WAQI enrichment where available' : `${selectedYear} modeled values`}
          {selectedYear !== 'Live' && <span className="ml-2 text-amber-500/80">· Estimates, not measurements</span>}
        </div>
        <div className="overflow-x-auto scroll-fade-x -mx-1 px-1">
          <table className="w-full text-xs">
            <caption className="sr-only">Pollutant levels by station for {selectedYear === 'Live' ? 'live data' : `${selectedYear} modeled data`}</caption>
            <thead>
              <tr className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">
                {['City', 'AQI', 'PM2.5', 'PM10', 'NO₂', 'O₃', 'CO', 'SO₂', 'Status'].map(h => (
                  <th key={h} scope="col" className="text-left pb-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stations.slice(0, 10).map(s => (
                <tr key={s.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-2 pr-4 font-medium text-slate-200">{s.city}</td>
                  <td className="py-2 pr-4 font-mono font-bold" style={{ color: s.aqi > 200 ? '#f43f5e' : s.aqi > 100 ? '#fbbf24' : '#34d399' }}>{s.aqi}</td>
                  <td className="py-2 pr-4 font-mono text-slate-300">{s.pm25 ?? '—'}</td>
                  <td className="py-2 pr-4 font-mono text-slate-300">{s.pm10 ?? '—'}</td>
                  <td className="py-2 pr-4 font-mono text-slate-300">{s.no2 ?? '—'}</td>
                  <td className="py-2 pr-4 font-mono text-slate-300">{s.o3 ?? '—'}</td>
                  <td className="py-2 pr-4 font-mono text-slate-300">{s.co ?? '—'}</td>
                  <td className="py-2 pr-4 font-mono text-slate-300">{s.so2 ?? '—'}</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono"
                      style={{ background: s.aqi > 200 ? 'rgba(244,63,94,0.12)' : 'rgba(52,211,153,0.1)', color: s.aqi > 200 ? '#fca5a5' : '#6ee7b7' }}>
                      {s.isLive ? '● Live' : s.isModeled ? '◎ Model' : '○ Ref'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-[10px] text-slate-600 mt-2 sm:hidden">Swipe to see more columns →</div>
      </motion.div>
    </div>
  );
}

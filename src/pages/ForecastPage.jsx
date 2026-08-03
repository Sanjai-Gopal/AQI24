import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { ChipGroup, ToggleChip } from '../components/ui/Chip';
import { StatusBadge } from '../components/ui/Badge';
import MethodologyNote from '../components/ui/MethodologyNote';
import { aqiStations } from '../data/mockData';
import { fetchForecast } from '../utils/api';
import { getAQIColor, getAQICategory } from '../utils/aqiUtils';
import { chartTooltipStyle, ErrorBanner, PanelTitle, EmptyState } from '../components/ui/Shared';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';

const CITIES = aqiStations.slice(0, 12).map(s => s.city);

export default function ForecastPage() {
  const [city, setCity] = useState('Delhi');
  const [forecast, setForecast] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const load = useCallback(async (selectedCity) => {
    setStatus('loading');
    setError(null);
    const station = aqiStations.find(s => s.city === selectedCity) || aqiStations[0];
    const result = await fetchForecast(station.lat, station.lng, selectedCity);
    if (result.error) {
      setStatus('error');
      setError(result.error);
      setForecast(null);
    } else if (Array.isArray(result) && result.length > 0) {
      setForecast(result);
      setStatus('live');
      setLastFetched(new Date());
    } else {
      setStatus('error');
      setError('No forecast data returned');
      setForecast(null);
    }
  }, []);

  useEffect(() => { load(city); }, [city, load]);

  const station = aqiStations.find(s => s.city === city);
  const currentAQI = station?.aqi ?? 0;
  const currentCat = getAQICategory(currentAQI);
  const currentColor = getAQIColor(currentAQI);

  const chartData = forecast?.map(d => ({
    date: d.date, aqi: d.aqi, pm25: d.pm25, pm10: d.pm10,
  })) || [];

  const maxAQI = forecast ? Math.max(...forecast.map(d => d.aqi)) : 0;
  const minAQI = forecast ? Math.min(...forecast.map(d => d.aqi)) : 0;
  const trend = forecast && forecast.length >= 2
    ? forecast[forecast.length - 1].aqi - forecast[0].aqi : 0;

  const isLoading = status === 'loading';

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        eyebrow="7-Day Forecast · Open-Meteo Air Quality API"
        title="AQI Forecast"
        description="PM2.5-derived AQI forecasts from Open-Meteo's free air quality model (CAMS global). AQI computed using EPA standard breakpoints."
        accent="violet"
      >
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          {status === 'live' && <StatusBadge tone="live" pulse>Open-Meteo · Live</StatusBadge>}
          <button onClick={() => load(city)} disabled={isLoading}
            aria-label="Refresh forecast"
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all disabled:opacity-40">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />
          </button>
        </div>
      </PageHeader>

      {/* City selector */}
      <ChipGroup label="Select city for forecast">
        {CITIES.map(c => (
          <ToggleChip key={c} active={city === c} onClick={() => setCity(c)} accent="violet">
            {c}
          </ToggleChip>
        ))}
      </ChipGroup>

      {error && <ErrorBanner message={`Forecast unavailable: ${error}`} onRetry={() => load(city)} />}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <div key={i} className="panel p-4 space-y-3"><div className="skeleton h-3 w-20 rounded" /><div className="skeleton h-7 w-14 rounded" /><div className="skeleton h-2.5 w-24 rounded" /></div>)
        ) : (
        [
          { label: 'Current AQI', value: currentAQI, color: currentColor, sub: currentCat },
          { label: '7-Day Peak', value: (maxAQI || '—'), color: '#f87171', sub: 'forecast maximum' },
          { label: '7-Day Low', value: (minAQI || '—'), color: '#34d399', sub: 'forecast minimum' },
          {
            label: 'Weekly Trend',
            value: (trend > 0 ? `+${trend}` : trend),
            color: trend > 10 ? '#f87171' : trend < -10 ? '#34d399' : '#94a3b8',
            sub: 'day 1 → day 7',
            icon: trend > 10 ? TrendingUp : trend < -10 ? TrendingDown : Minus,
          },
        ].map((kpi, i) => {
          const KpiIcon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -2 }}
              className="panel p-4 relative overflow-hidden"
            >
              <div className="text-[10px] text-slate-500 mb-1.5 font-mono uppercase tracking-wider">{kpi.label}</div>
              <div className="text-2xl font-black font-mono flex items-center gap-1" style={{ color: kpi.color }}>
                {KpiIcon && <KpiIcon size={18} aria-hidden="true" />}
                {kpi.value}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">{kpi.sub}</div>
            </motion.div>
          );
        })
        )}
      </div>

      {/* Chart */}
      <div className="panel p-5">
        <PanelTitle title={`7-Day AQI Forecast — ${city}`} subtitle={`Source: Open-Meteo CAMS · EPA PM2.5→AQI${lastFetched ? ` · Fetched ${lastFetched.toLocaleTimeString('en-IN')} IST` : ''}`} />
        {isLoading ? (
          <div className="h-48 rounded-xl skeleton" />
        ) : chartData.length > 0 ? (
          <div role="img" aria-label={`7-day AQI forecast chart for ${city}. Values range from ${minAQI} to ${maxAQI}.`}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="aqiGradFcast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} />
                <ReferenceLine y={100} stroke="rgba(251,191,36,0.35)" strokeDasharray="4 4" label={{ value: 'Moderate', fill: '#fbbf24', fontSize: 9 }} />
                <ReferenceLine y={200} stroke="rgba(248,113,113,0.35)" strokeDasharray="4 4" label={{ value: 'Unhealthy', fill: '#f87171', fontSize: 9 }} />
                <Area type="monotone" dataKey="aqi" stroke="#a78bfa" strokeWidth={2} fill="url(#aqiGradFcast)" dot={{ fill: '#a78bfa', r: 3 }}
                  isAnimationActive={true} animationDuration={800} animationEasing="easeOut" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : !error && <EmptyState title="No forecast data" message="No air quality forecast available for this city." />}
      </div>

      {/* Day cards */}
      {forecast && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {forecast.map((d, i) => {
            const color = getAQIColor(d.aqi);
            return (
              <motion.div
                key={d.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2, scale: 1.03 }}
                className="panel p-3 text-center"
              >
                <div className="text-[10px] font-mono text-slate-500 mb-1">
                  {new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <div className="text-xl font-black font-mono" style={{ color }}>{d.aqi}</div>
                <div className="text-[10px] mt-1" style={{ color }}>{getAQICategory(d.aqi).split(' ')[0]}</div>
                {d.pm25 != null && <div className="text-[10px] text-slate-600 mt-1 font-mono">PM2.5: {d.pm25}</div>}
              </motion.div>
            );
          })}
        </div>
      )}

      <MethodologyNote accent="violet">
        PM2.5 hourly forecasts from Open-Meteo (CAMS global atmospheric model) are aggregated to daily averages.
        AQI is computed via EPA standard linear interpolation using official PM2.5 breakpoints (0–500 scale).
        No simulated or random values are used. Data reflects model uncertainty typical of 5–7 day air quality forecasts.
      </MethodologyNote>
    </div>
  );
}

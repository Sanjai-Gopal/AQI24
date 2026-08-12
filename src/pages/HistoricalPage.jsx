import { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Database, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import { ChipGroup, ToggleChip } from '../components/ui/Chip';
import ChartExportButtons from '../components/ui/ChartExportButtons';
import LocationPicker from '../components/ui/LocationPicker';
import { historicalYearlyData } from '../data/mockData';
import { getStationsForYear, getTrendDataForYear } from '../utils/timelineUtils';
import { getAQIColor, getAQICategory } from '../utils/aqiUtils';
import { chartTooltipStyle, ModeledDataBanner, PanelTitle, StyledSelect, EmptyState } from '../components/ui/Shared';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, ReferenceLine
} from 'recharts';
import { useLocation } from '../context/LocationContext';

const YEARS = Array.from({ length: 37 }, (_, i) => 1990 + i);
const YEAR_OPTIONS = YEARS.map(y => ({ value: y, label: String(y) }));
const METRICS = [
  { key: 'aqi', label: 'AQI', cityKey: 'aqi', nationalKey: 'national', color: '#22d3ee' },
  { key: 'pm25', label: 'PM2.5', cityKey: 'pm25', nationalKey: 'pm25', color: '#a78bfa', suffix: ' µg/m³' },
  { key: 'fires', label: 'Fires', cityKey: null, nationalKey: 'fires', color: '#fbbf24', suffix: '' },
];

export default function HistoricalPage() {
  const { city } = useLocation();
  const [year, setYear] = useState(2024);
  const [metric, setMetric] = useState('aqi');
  const [compareYear, setCompareYear] = useState(1990);
  const chartRef = useRef(null);

  const metricCfg = METRICS.find(m => m.key === metric);

  // Full per-city series for the selected metric, 1990–2026.
  const series = useMemo(() => {
    return YEARS.map(y => {
      const cityRow = getStationsForYear(y).find(s => s.city === city);
      const nat = historicalYearlyData.find(d => d.year === y);
      return {
        year: y,
        cityValue: metricCfg.cityKey ? (cityRow?.[metricCfg.cityKey] ?? null) : null,
        nationalValue: nat?.[metricCfg.nationalKey] ?? null,
        aqi: cityRow?.aqi ?? null,
      };
    });
  }, [city, metricCfg]);

  const selectedRow = series.find(d => d.year === year) || null;
  const compareRow = series.find(d => d.year === compareYear) || null;

  const cityValue = selectedRow?.cityValue ?? selectedRow?.nationalValue;
  const natValue = selectedRow?.nationalValue ?? null;
  const nat1990 = series.find(d => d.year === 1990)?.nationalValue ?? null;
  const prevRow = series.find(d => d.year === year - 1) || null;

  const pctVs1990 = natValue != null && nat1990 != null && nat1990 !== 0
    ? Math.round(((natValue - nat1990) / nat1990) * 100) : null;
  const pctVsPrev = cityValue != null && prevRow?.cityValue != null && prevRow.cityValue !== 0
    ? Math.round(((cityValue - prevRow.cityValue) / prevRow.cityValue) * 100) : null;

  const best = useMemo(() => {
    const valid = series.filter(d => (d.cityValue ?? d.nationalValue) != null);
    if (!valid.length) return null;
    return valid.reduce((a, b) => ((b.cityValue ?? b.nationalValue) < (a.cityValue ?? a.nationalValue) ? b : a));
  }, [series]);
  const worst = useMemo(() => {
    const valid = series.filter(d => (d.cityValue ?? d.nationalValue) != null);
    if (!valid.length) return null;
    return valid.reduce((a, b) => ((b.cityValue ?? b.nationalValue) > (a.cityValue ?? a.nationalValue) ? b : a));
  }, [series]);

  // Seasonal reference (national monthly, Jan–Jun).
  const monthly = useMemo(() => {
    const t = getTrendDataForYear(year).monthly || [];
    return t.map(m => ({ month: m.month, national: m.national ?? null }));
  }, [year]);

  const compareChartData = useMemo(() => {
    return [selectedRow, compareRow].filter(Boolean).map(d => ({
      year: d.year,
      cityValue: d.cityValue ?? d.nationalValue,
    }));
  }, [selectedRow, compareRow]);

  const showFires = metric === 'fires';
  const unitLabel = showFires ? 'events' : metric === 'pm25' ? 'µg/m³' : 'index';

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-4 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <SectionHeader
          eyebrow="History"
          title="Air quality over the years"
          description="Annual reference records of air quality and weather, from 1990 to today. These are modelled reference estimates for context — not ground-station measurements."
          accent="emerald"
        />
        <ModeledDataBanner />
      </div>

      {/* Controls */}
      <div className="panel p-5 flex flex-col md:flex-row gap-4 items-start md:items-end">
        <div className="w-full md:max-w-sm flex flex-col gap-3">
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Location</span>
          <LocationPicker compact />
        </div>
        <div className="flex items-end gap-4 flex-wrap md:ml-auto">
          <StyledSelect id="hist-year" label="Year" value={year} onChange={e => setYear(+e.target.value)} options={YEAR_OPTIONS} />
          <StyledSelect id="hist-compare" label="Compare with" value={compareYear} onChange={e => setCompareYear(+e.target.value)} options={YEAR_OPTIONS} />
          <ChipGroup label="Metric">
            {METRICS.map(m => (
              <ToggleChip key={m.key} active={metric === m.key} onClick={() => setMetric(m.key)} accent="emerald">
                {m.label}
              </ToggleChip>
            ))}
          </ChipGroup>
        </div>
      </div>

      {/* What to explore */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { icon: TrendingUp, title: 'The long-term trend', text: 'See how the yearly average has moved across three decades.' },
          { icon: TrendingDown, title: 'How two years compare', text: 'Pick any two years and compare them side by side.' },
          { icon: Database, title: 'The seasonal pattern', text: 'A yearly reference pattern shows when months tend to be cleaner.' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="panel p-4 flex items-start gap-3">
            <Icon size={16} className="text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <div className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>{title}</div>
              <p className="text-[11px] leading-relaxed mt-1" style={{ color: 'var(--text-muted)' }}>{text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Annual overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: `${city} ${year}`,
            value: cityValue,
            color: metric === 'aqi' && cityValue != null ? getAQIColor(cityValue) : metricCfg.color,
            sub: metric === 'aqi' && cityValue != null ? getAQICategory(cityValue) : (metricCfg.suffix || ''),
            foot: pctVsPrev != null ? `vs ${year - 1}: ${pctVsPrev > 0 ? '+' : ''}${pctVsPrev}%` : '—',
          },
          {
            label: `National ${year}`,
            value: natValue,
            color: metric === 'aqi' && natValue != null ? getAQIColor(natValue) : metricCfg.color,
            sub: metric === 'aqi' && natValue != null ? getAQICategory(natValue) : (metricCfg.suffix || ''),
            foot: pctVs1990 != null ? `vs 1990: ${pctVs1990 > 0 ? '+' : ''}${pctVs1990}%` : '—',
          },
          {
            label: 'Best year',
            value: best ? (best.cityValue ?? best.nationalValue) : null,
            color: '#34d399',
            sub: best ? String(best.year) : '—',
            foot: best ? `in ${city}` : '—',
          },
          {
            label: 'Worst year',
            value: worst ? (worst.cityValue ?? worst.nationalValue) : null,
            color: '#f87171',
            sub: worst ? String(worst.year) : '—',
            foot: worst ? `in ${city}` : '—',
          },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="panel p-4">
            <div className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-faint)' }}>{kpi.label}</div>
            <div className="text-2xl font-black font-mono" style={{ color: kpi.color }}>{kpi.value ?? '—'}</div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{kpi.sub}</div>
            <div className="text-[10px] font-mono mt-1" style={{ color: kpi.foot?.startsWith('+') ? '#f87171' : kpi.foot?.startsWith('-') ? '#34d399' : 'var(--text-faint)' }}>{kpi.foot}</div>
          </motion.div>
        ))}
      </div>

      {/* Main trend chart */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <PanelTitle
            title={`${metricCfg.label} trend — ${city}`}
            subtitle={`Reference estimates · ${unitLabel} · 1990–2026`}
          />
          <ChartExportButtons
            chartRef={chartRef}
            filename={`aqi24-history-${city.toLowerCase()}-${metric}`}
            csvData={series.map(d => ({ year: d.year, city: d.cityValue, national: d.nationalValue }))}
          />
        </div>
        <div className="h-72" ref={chartRef} role="img" aria-label={`${metricCfg.label} trend chart for ${city} from 1990 to 2026.`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="cityHistGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metricCfg.color} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={metricCfg.color} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="natHistGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={44} />
              <Tooltip {...chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
              {year >= 1990 && <ReferenceLine x={year} stroke="rgba(34,211,238,0.4)" strokeDasharray="4 4" label={{ value: String(year), fill: '#22d3ee', fontSize: 10 }} />}
              <Area type="monotone" dataKey="cityValue" name={city} stroke={metricCfg.color} fill="url(#cityHistGrad)" strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={900} animationEasing="easeOut" />
              <Area type="monotone" dataKey="nationalValue" name="National" stroke="#94a3b8" fill="url(#natHistGrad)" strokeWidth={1.5} dot={false} isAnimationActive={true} animationDuration={1100} animationEasing="easeOut" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Year-on-year comparison */}
      <div className="grid lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="panel p-5">
          <PanelTitle title="Year-on-year comparison" subtitle={`${compareYear} vs ${year} — ${city}, ${metricCfg.label}`} />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="cityValue" name={showFires ? `National · ${metricCfg.label}` : `${city} · ${metricCfg.label}`} radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={500}>
                  {compareChartData.map((d, i) => (
                    <Cell key={i} fill={d.year === year ? metricCfg.color : '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {compareRow?.cityValue != null && selectedRow?.cityValue != null && (
            <p className="mt-3 text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              {compareRow.cityValue === selectedRow.cityValue
                ? <><Minus size={14} className="text-slate-400" aria-hidden="true" /> Similar to {compareYear}.</>
                : compareRow.cityValue < selectedRow.cityValue
                  ? <><TrendingUp size={14} className="text-rose-400" aria-hidden="true" /> Up from {compareYear} ({selectedRow.cityValue - compareRow.cityValue} {unitLabel}).</>
                  : <><TrendingDown size={14} className="text-emerald-400" aria-hidden="true" /> Down from {compareYear} ({compareRow.cityValue - selectedRow.cityValue} {unitLabel}).</>}
            </p>
          )}
        </motion.div>

        {/* Seasonal reference */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="panel p-5">
          <PanelTitle title="Seasonal reference" subtitle={`National monthly pattern (Jan–Jun) — ${year}`} />
          {monthly.some(m => m.national != null) ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="national" name="National AQI" fill="#34d399" radius={[3, 3, 0, 0]} isAnimationActive={true} animationDuration={600} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No seasonal data" message="Monthly reference records are not available for this period." icon={Database} />
          )}
        </motion.div>
      </div>

      {/* Data table */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="panel p-5">
        <PanelTitle title={`Annual records — ${city}`} subtitle={`Reference ${metricCfg.label} by year, 1990–2026`} />
        <div className="overflow-x-auto scroll-fade-x -mx-1 px-1">
          <table className="w-full text-xs">
            <caption className="sr-only">Reference historical {metricCfg.label} for {city} from 1990 to 2026</caption>
            <thead>
              <tr className="font-mono uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-faint)' }}>
                <th scope="col" className="text-left pb-2 pr-6">Year</th>
                <th scope="col" className="text-left pb-2 pr-6">{city}</th>
                <th scope="col" className="text-left pb-2 pr-6">National</th>
                <th scope="col" className="text-left pb-2">Category (AQI)</th>
              </tr>
            </thead>
            <tbody>
              {[...series].reverse().map(d => (
                <tr key={d.year} className="border-t hover:bg-white/[0.03] transition-colors" style={{ borderColor: 'var(--panel-border)' }}>
                  <td className="py-2 pr-6 font-mono font-bold text-cyan-400">{d.year}</td>
                  <td className="py-2 pr-6 font-mono" style={{ color: metric === 'aqi' && d.cityValue != null ? getAQIColor(d.cityValue) : 'var(--text-sub)' }}>
                    {d.cityValue ?? '—'}
                  </td>
                  <td className="py-2 pr-6 font-mono" style={{ color: metric === 'aqi' && d.nationalValue != null ? getAQIColor(d.nationalValue) : 'var(--text-sub)' }}>
                    {d.nationalValue ?? '—'}
                  </td>
                  <td className="py-2 font-mono" style={{ color: 'var(--text-faint)' }}>
                    {d.aqi != null ? getAQICategory(d.aqi) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-[10px] mt-2 sm:hidden" style={{ color: 'var(--text-faint)' }}>Swipe to see more columns →</div>
      </motion.div>
    </div>
  );
}

import { useState, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { Database } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import { ChipGroup, ToggleChip } from '../components/ui/Chip';
import ChartExportButtons from '../components/ui/ChartExportButtons';
import { historicalYearlyData } from '../data/mockData';
import { chartTooltipStyle, ModeledDataBanner, PanelTitle, StyledSelect, EmptyState } from '../components/ui/Shared';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, Cell
} from 'recharts';
import { getAQIColor } from '../utils/aqiUtils';

const YEAR_OPTIONS = Array.from({ length: 37 }, (_, i) => ({ value: 1990 + i, label: String(1990 + i) }));

export default function HistoricalPage() {
  const [rangeStart, setRangeStart] = useState(1990);
  const [rangeEnd, setRangeEnd] = useState(2026);
  const [view, setView] = useState('trend');
  const chartRef = useRef(null);

  const filtered = useMemo(
    () => historicalYearlyData.filter(d => d.year >= rangeStart && d.year <= rangeEnd),
    [rangeStart, rangeEnd]
  );

  const milestones = [
    { year: 2000, label: 'MODIS' },
    { year: 2012, label: 'VIIRS' },
    { year: 2017, label: 'S5P' },
    { year: 2020, label: 'COVID' },
  ].filter(m => m.year >= rangeStart && m.year <= rangeEnd);

  const hasData = filtered.length > 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-4">
        <SectionHeader
          eyebrow="Historical Dataset — 1980 to 2026"
          title="Long-Term AQI Trend Analysis"
          description="Air quality trend derived from MERRA-2 reanalysis (1980–present) and CPCB baseline scaling. Values are interpolated estimates — not raw CPCB measurements."
          accent="emerald"
        />
        <ModeledDataBanner />
      </div>

      {/* Controls */}
      <div className="panel p-5 flex flex-col md:flex-row gap-4 items-start md:items-end">
        <ChipGroup label="Chart view type">
          {['trend', 'bar', 'fires'].map(v => (
            <ToggleChip key={v} active={view === v} onClick={() => setView(v)} accent="emerald">
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </ToggleChip>
          ))}
        </ChipGroup>
        <div className="flex items-end gap-4 flex-wrap">
          <StyledSelect
            id="hist-range-start"
            label="From"
            value={rangeStart}
            onChange={e => setRangeStart(+e.target.value)}
            options={YEAR_OPTIONS}
          />
          <StyledSelect
            id="hist-range-end"
            label="To"
            value={rangeEnd}
            onChange={e => setRangeEnd(+e.target.value)}
            options={YEAR_OPTIONS}
          />
        </div>
        <div className="text-xs font-mono text-slate-600 md:ml-auto">{filtered.length} years · {rangeStart}–{rangeEnd}</div>
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="panel panel-hover p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <PanelTitle
            title={view === 'trend' ? 'National AQI Trend' : view === 'bar' ? 'Annual AQI Comparison' : 'Active Fire Events'}
            subtitle={view === 'fires' ? 'Estimated fire count based on FIRMS scaling' : 'Modeled estimate — CPCB baseline'}
          />
          {hasData && (
            <ChartExportButtons
              chartRef={chartRef}
              filename={`aqi24-historical-${view}`}
              csvData={filtered.map(d => view === 'fires' ? ({ year: d.year, fires: d.fires }) : ({ year: d.year, delhi: d.delhi, national: d.national }))}
            />
          )}
        </div>
        {!hasData ? (
          <EmptyState title="No data in range" message="Adjust the year range to see historical data." icon={Database} />
        ) : (
          <div ref={chartRef} role="img" aria-label={
            view === 'trend' ? `Area chart of Delhi and national average AQI from ${rangeStart} to ${rangeEnd}` :
            view === 'bar' ? `Bar chart of national average AQI by year from ${rangeStart} to ${rangeEnd}` :
            `Area chart of estimated active fire events from ${rangeStart} to ${rangeEnd}`
          }>
            <ResponsiveContainer width="100%" height={280}>
              {view === 'trend' ? (
                <AreaChart data={filtered}>
                  <defs>
                    <linearGradient id="delGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="natGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                  {milestones.map(m => (
                    <ReferenceLine key={m.year} x={m.year} stroke="rgba(167,139,250,0.3)" strokeDasharray="4 4"
                      label={{ value: m.label, fill: '#a78bfa', fontSize: 9, position: 'insideTopLeft' }} />
                  ))}
                  <Area type="monotone" dataKey="delhi" name="Delhi" stroke="#f87171" fill="url(#delGrad)" strokeWidth={2} dot={false}
                    isAnimationActive={true} animationDuration={800} animationEasing="easeOut" />
                  <Area type="monotone" dataKey="national" name="National Avg" stroke="#22d3ee" fill="url(#natGrad)" strokeWidth={1.5} dot={false}
                    isAnimationActive={true} animationDuration={1000} animationEasing="easeOut" />
                </AreaChart>
              ) : view === 'bar' ? (
                <BarChart data={filtered}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="national" name="National Avg AQI" radius={[2, 2, 0, 0]}
                    isAnimationActive={true} animationDuration={600} animationEasing="easeOut">
                    {filtered.map((d, i) => <Cell key={i} fill={getAQIColor(d.national)} />)}
                  </Bar>
                </BarChart>
              ) : (
                <AreaChart data={filtered}>
                  <defs>
                    <linearGradient id="fireGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Area type="monotone" dataKey="fires" name="Active Fires" stroke="#fbbf24" fill="url(#fireGrad)" strokeWidth={2} dot={false}
                    isAnimationActive={true} animationDuration={800} animationEasing="easeOut" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Data table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="panel p-5">
        <PanelTitle title="Annual Data Table" subtitle="Modeled national and Delhi AQI with fire counts" />
        <div className="overflow-x-auto scroll-fade-x -mx-1 px-1">
          <table className="w-full text-xs">
            <caption className="sr-only">Historical AQI and fire data from {rangeStart} to {rangeEnd}</caption>
            <thead>
              <tr className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">
                {['Year', 'National AQI', 'Delhi AQI', 'PM2.5 µg/m³', 'Active Fires', 'Stations'].map(h => (
                  <th key={h} scope="col" className="text-left pb-2 pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...filtered].reverse().map(d => (
                <tr key={d.year} className="border-t border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="py-2 pr-6 font-mono font-bold text-cyan-400">{d.year}</td>
                  <td className="py-2 pr-6 font-mono" style={{ color: getAQIColor(d.national) }}>{d.national}</td>
                  <td className="py-2 pr-6 font-mono" style={{ color: getAQIColor(d.delhi) }}>{d.delhi}</td>
                  <td className="py-2 pr-6 font-mono text-slate-300">{d.pm25}</td>
                  <td className="py-2 pr-6 font-mono text-amber-400">{d.fires?.toLocaleString() ?? '—'}</td>
                  <td className="py-2 font-mono text-slate-500">{d.stations ?? '—'}</td>
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

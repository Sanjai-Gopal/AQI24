import { useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import SectionHeader from '../components/ui/SectionHeader';
import ChartExportButtons from '../components/ui/ChartExportButtons';
import { AQITrendChart, HCHOFireChart, PollutantPieChart, StateAQIChart } from '../components/charts/AnalyticsCharts';
import { getTrendDataForYear } from '../utils/timelineUtils';
import { ModeledDataBanner, PanelTitle, EmptyState } from '../components/ui/Shared';
import { ChartBar as BarChart3 } from 'lucide-react';

export default function AnalyticsPage({ selectedYear = 'Live' }) {
  const data = useMemo(() => getTrendDataForYear(selectedYear), [selectedYear]);
  const trendRef = useRef(null);
  const hchoRef = useRef(null);
  const pieRef = useRef(null);
  const stateRef = useRef(null);

  const monthly = Array.isArray(data?.monthly) ? data.monthly : [];
  const hchoTrend = Array.isArray(data?.hchoTrend) ? data.hchoTrend : [];
  const stateAQI = Array.isArray(data?.stateAQI) ? data.stateAQI : [];

  const ozoneRatio = parseInt(selectedYear) <= 1995 ? 0.22 : 0.12;
  const pmRatio = parseInt(selectedYear) <= 1995 ? 0.20 : 0.38;
  const pollutantBreakdown = useMemo(() =>
    Array.isArray(data?.pollutantBreakdown)
      ? data.pollutantBreakdown.map(p => {
          if (!p) return null;
          if (p.name === 'O₃') return { ...p, value: Math.max(1, Math.round(p.value * (ozoneRatio / 0.12))) };
          if (p.name === 'PM2.5') return { ...p, value: Math.max(1, Math.round(p.value * (pmRatio / 0.38))) };
          return p;
        }).filter(Boolean)
      : [],
  [data, ozoneRatio, pmRatio]);

  const hasData = monthly.length > 0 || hchoTrend.length > 0 || stateAQI.length > 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <SectionHeader
        eyebrow={`Trends & Analysis — ${selectedYear}`}
        title="Trends & Correlations"
        description={`Seasonal reference series for AQI, HCHO column density, and active fires across Indian subregions for ${selectedYear}.`}
        accent="emerald"
      />

      {selectedYear !== 'Live' && <ModeledDataBanner />}

      {!hasData ? (
        <EmptyState title="No analytical data" message={`No trend data available for ${selectedYear}. Try selecting a different year.`} icon={BarChart3} />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="panel panel-hover p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <PanelTitle title="AQI Monthly Trends" subtitle={`Jan–Jun seasonal averages · ${selectedYear}`} />
              <ChartExportButtons chartRef={trendRef} filename={`aqi24-trends-monthly`} />
            </div>
            <div ref={trendRef} role="img" aria-label={`Line chart of monthly AQI trends for Delhi, Mumbai, Chennai and Kolkata in ${selectedYear}`}>
              <AQITrendChart data={monthly} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="panel panel-hover p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <PanelTitle title="HCHO Columns vs Active Fires" subtitle="HCHO column density vs fire counts by month" />
              <ChartExportButtons chartRef={hchoRef} filename={`aqi24-trends-hcho-fires`} />
            </div>
            <div ref={hchoRef} role="img" aria-label={`Dual-axis chart comparing HCHO column density and active fire counts by month in ${selectedYear}`}>
              <HCHOFireChart data={hchoTrend} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="panel panel-hover p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <PanelTitle title="Pollutant Composition" subtitle="Weighted relative chemical shares" />
              <ChartExportButtons chartRef={pieRef} filename={`aqi24-trends-pollutants`} />
            </div>
            <div ref={pieRef} role="img" aria-label={`Donut chart showing the proportion of PM2.5, PM10, NO2, O3, CO and SO2 in ${selectedYear}`}>
              <PollutantPieChart data={pollutantBreakdown} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="panel panel-hover p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <PanelTitle title="State-wise AQI Ranking" subtitle="Worst-affected subregions" />
              <ChartExportButtons chartRef={stateRef} filename={`aqi24-trends-states`} />
            </div>
            <div ref={stateRef} role="img" aria-label={`Horizontal bar chart ranking Indian states by average AQI in ${selectedYear}`}>
              <StateAQIChart data={stateAQI} />
            </div>
          </motion.div>
        </div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="panel p-5">
        <PanelTitle title="Key insights" subtitle={`Seasonal reference observations · ${selectedYear}`} />
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              title: 'HCHO–Fire pattern',
              value: parseInt(selectedYear) <= 1995 ? 'Localised' : 'Oct–Nov peak',
              color: '#22d3ee',
              desc: parseInt(selectedYear) <= 1995
                ? 'Earlier years show a localised biomass pattern with limited regional spread in the reference series.'
                : 'The reference series shows HCHO and fire activity rising together in Oct–Nov over NW India — consistent with stubble-clearing season.',
            },
            {
              title: 'Particulate Transport',
              value: parseInt(selectedYear) <= 1995 ? 'Local only' : '6–12 hr lag',
              color: '#fbbf24',
              desc: parseInt(selectedYear) <= 1995
                ? 'Minimal micro-aerosol transport. Ground levels governed by dry deposition and local winds.'
                : 'Sub-micron particles from harvest belts reach northern urban hubs within hours.',
            },
            {
              title: 'Data Source',
              value: selectedYear === 'Live' ? 'Current readings' : 'Reference records',
              color: selectedYear === 'Live' ? '#34d399' : '#fbbf24',
              desc: selectedYear === 'Live'
                ? 'WAQI station network for current readings. Open-Meteo CAMS for forecasts. NASA FIRMS for fire data.'
                : `Interpolated from CPCB annual reports and NCAP targets. Multiplier: ${((parseInt(selectedYear) <= 2020 ? 0.65 : 1.0))}×`,
            },
          ].map((ins, i) => (
            <motion.div
              key={ins.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              whileHover={{ y: -2 }}
              className="rounded-xl p-4 transition-all"
              style={{ background: `${ins.color}08`, border: `1px solid ${ins.color}18` }}
            >
              <div className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider mb-1.5">{ins.title}</div>
              <div className="text-lg font-bold font-mono mb-2" style={{ color: ins.color }}>{ins.value}</div>
              <p className="text-slate-400 text-xs leading-relaxed">{ins.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

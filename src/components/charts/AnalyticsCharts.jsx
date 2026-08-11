import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart, ComposedChart,
} from 'recharts';
import { motion } from 'motion/react';
import { chartTooltipStyle as tooltipStyle } from '../ui/Shared';

// Safe wrapper that never renders charts with no data
function ChartShell({ data, height = 256, fallback = 'No data available', children }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-slate-600 text-sm">
        {fallback}
      </div>
    );
  }
  return (
    <div style={{ width: '100%', minHeight: height, height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function AQITrendChart({ data }) {
  const safe = Array.isArray(data) ? data : [];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
      <ChartShell data={safe} height={256}>
        <AreaChart data={safe} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {[['delhi','#f87171'],['mumbai','#22d3ee'],['kolkata','#a78bfa'],['national','#fbbf24']].map(([k,c]) => (
              <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={c} stopOpacity={0.3} />
                <stop offset="95%" stopColor={c} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
          {[['delhi','#f87171','Delhi'],['mumbai','#22d3ee','Mumbai'],['kolkata','#a78bfa','Kolkata'],['national','#fbbf24','National Avg']].map(([k,c,label]) => (
            <Area key={k} type="monotone" dataKey={k} name={label} stroke={c} strokeWidth={2} fill={`url(#grad-${k})`} dot={false} />
          ))}
        </AreaChart>
      </ChartShell>
    </motion.div>
  );
}

export function HCHOFireChart({ data }) {
  const safe = Array.isArray(data) ? data : [];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
      <ChartShell data={safe} height={256}>
        <ComposedChart data={safe} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
          <Bar yAxisId="right" dataKey="fires" name="Active Fires" fill="#fb923c" fillOpacity={0.7} radius={[2,2,0,0]} />
          <Line yAxisId="left" type="monotone" dataKey="hcho" name="HCHO (×10¹⁵)" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee', r: 3 }} />
        </ComposedChart>
      </ChartShell>
    </motion.div>
  );
}

export function PollutantPieChart({ data }) {
  const safe = Array.isArray(data) ? data.filter(d => d && d.value > 0) : [];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
      <ChartShell data={safe} height={256} fallback="No pollutant data">
        <PieChart>
          <Pie
            data={safe}
            cx="50%" cy="50%"
            innerRadius={55} outerRadius={85}
            paddingAngle={3} dataKey="value"
            label={({ name, value }) => `${name} ${value}%`}
            labelLine={{ stroke: 'rgba(255,255,255,0.15)' }}
          >
            {safe.map((entry, i) => (
              <Cell key={i} fill={entry.fill || '#22d3ee'} fillOpacity={0.85} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} formatter={(v) => `${v}%`} />
        </PieChart>
      </ChartShell>
    </motion.div>
  );
}

export function StateAQIChart({ data }) {
  const safe = Array.isArray(data) ? data : [];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
      <ChartShell data={safe} height={256} fallback="No state AQI data">
        <BarChart data={safe} layout="vertical" margin={{ top: 0, right: 40, left: 60, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} domain={[0, 400]} />
          <YAxis type="category" dataKey="state" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="aqi" name="AQI" radius={[0,3,3,0]}>
            {safe.map((entry, i) => (
              <Cell key={i} fill={
                entry.aqi > 300 ? '#f43f5e' :
                entry.aqi > 200 ? '#c084fc' :
                entry.aqi > 150 ? '#f87171' :
                entry.aqi > 100 ? '#fb923c' :
                entry.aqi > 50  ? '#fbbf24' : '#34d399'
              } />
            ))}
          </Bar>
        </BarChart>
      </ChartShell>
    </motion.div>
  );
}

export function HourlyAQIChart({ data }) {
  const safe = Array.isArray(data) ? data : [];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
      <ChartShell data={safe} height={192}>
        <AreaChart data={safe} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="grad-hourly" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} interval={3} />
          <YAxis tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipStyle} />
          <Area type="monotone" dataKey="aqi" name="AQI" stroke="#22d3ee" strokeWidth={2} fill="url(#grad-hourly)" dot={false} />
          <Area type="monotone" dataKey="pm25" name="PM2.5" stroke="#fb7185" strokeWidth={1.5} fill="none" dot={false} />
        </AreaChart>
      </ChartShell>
    </motion.div>
  );
}

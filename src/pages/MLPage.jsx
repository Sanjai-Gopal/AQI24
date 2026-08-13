import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { Brain, Database, Target, Zap, TrendingUp, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, ArrowRight, Cpu, Layers, Microscope, ChevronDown } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { ChipGroup, ToggleChip } from '../components/ui/Chip';
import { StatusBadge } from '../components/ui/Badge';
import { fetchMLPredictions, severityColor, severityBg } from '../services/mlService';
import { fetchPm25Forecast, getBenchmarkMetrics } from '../services/pm25Service';

import { chartTooltipStyle as tooltipStyle } from '../components/ui/Shared';

function Skeleton({ h = 'h-40' }) {
  return <div className={`skeleton rounded-xl ${h} w-full`} />;
}

function MetricBadge({ label, value, unit, color, sub }) {
  const display = value == null || value === '' ? '—' : value;
  return (
    <div className="panel p-4 relative overflow-hidden">
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none"
        style={{ background: `${color}20`, filter: 'blur(16px)' }} />
      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-2xl font-black font-mono" style={{ color }}>{display}</div>
      {unit && <div className="text-[10px] text-slate-500 font-mono mt-0.5">{unit}</div>}
      {sub && <div className="text-[10px] text-slate-600 mt-1">{sub}</div>}
    </div>
  );
}

function Pm25ForecastDisplay({ modelName }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPm25Forecast().then(data => {
      if (!active) return;
      if (data.error) {
        setError(data.error);
      } else {
        setForecast(data);
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [modelName]);

  if (loading) {
    return (
      <div className="skeleton h-20 w-full" />
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-xs text-slate-500">
        Forecast unavailable
      </div>
    );
  }

  if (!forecast || forecast.model_status === 'unsupported_station') {
    return (
      <div className="text-center py-4 text-xs text-slate-500">
        Nehru Nagar only
      </div>
    );
  }

  const value = modelName === 'lightgbm' ? forecast.lightgbm_prediction : forecast.lstm_prediction;
  const color = modelName === 'lightgbm' ? '#a78bfa' : '#fbbf24';

  return (
    <div className="text-center">
      <div className="text-3xl font-black font-mono" style={{ color }}>{value ?? '—'}</div>
      <div className="text-[10px] text-slate-500 font-mono mt-1">µg/m³</div>
      <div className="text-[10px] text-slate-600 mt-2">MAE: {modelName === 'lightgbm' ? '24.22' : '24.45'} µg/m³</div>
    </div>
  );
}

// Workflow steps for the architecture diagram
const WORKFLOW = [
  { step: '01', title: 'Data Acquisition', icon: Database, color: '#22d3ee', desc: 'NASA FIRMS VIIRS S-NPP archive (2012–2026) — sampled for training' },
  { step: '02', title: 'Feature Engineering', icon: Layers, color: '#a78bfa', desc: 'Brightness, coordinates, seasonal cyclical encoding, pixel geometry' },
  { step: '03', title: 'Model Training', icon: Cpu, color: '#fbbf24', desc: 'LightGBM regressor + XGBoost classifier, temporal split' },
  { step: '04', title: 'Inference', icon: Zap, color: '#34d399', desc: 'FRP prediction (MW) + 4-class severity classification' },
];

export default function MLPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState('post_monsoon');
  const [brightnessLevel, setBrightnessLevel] = useState('medium');

  useEffect(() => {
    fetchMLPredictions().then(d => {
      if (d.error) setError(d.error);
      else setData(d);
      setLoading(false);
    });
  }, []);

  const info = data?.model_info;
  const allPreds = data?.regional_predictions || [];
  const filteredPreds = useMemo(
    () => allPreds.filter(p => p.season === season && p.brightness_level === brightnessLevel),
    [allPreds, season, brightnessLevel]
  );
  const topPreds = useMemo(
    () => [...filteredPreds].sort((a, b) => b.frp_predicted - a.frp_predicted),
    [filteredPreds]
  );

  const reg = info?.frp_regressor || {};
  const clf = info?.severity_classifier || {};
  const totalRecords = info?.total_records_in_dataset ?? info?.archive_total ?? null;

  const fmtNum = (v, digits = 2) =>
    v == null || isNaN(v) ? '—' : Number(v).toFixed(digits);
  const fmtPct = (v, digits = 1) =>
    v == null || isNaN(v) ? '—' : `${(Number(v) * 100).toFixed(digits)}%`;
  const fmtInt = (v) =>
    v == null || isNaN(v) ? '—' : Number(v).toLocaleString();

  const featureImportance = useMemo(() => info
    ? Object.entries(reg?.feature_importance || {})
        .slice(0, 8)
        .map(([k, v]) => ({ name: k.replace('_', '\n'), value: +(v * 100).toFixed(2) }))
    : [], [info, reg]);

  const clsImportance = useMemo(() => info
    ? Object.entries(clf?.feature_importance || {})
        .slice(0, 8)
        .map(([k, v]) => ({ name: k.replace('_', '\n'), value: +(v * 100).toFixed(2) }))
    : [], [info, clf]);

  return (
    <div className="p-4 md:p-6 space-y-8">
      <PageHeader
        eyebrow="Machine Learning · NASA FIRMS VIIRS S-NPP"
        title="Fire Radiative Power Prediction"
        description="LightGBM FRP regressor and XGBoost severity classifier trained on NASA FIRMS VIIRS S-NPP fire detections across India (2012–2026). Predicts FRP (MW) and fire severity class."
        accent="violet"
      >
        {info && (
          <StatusBadge tone="live" pulse>
            <CheckCircle size={11} aria-hidden="true" />
            <span>Model loaded</span>
          </StatusBadge>
        )}
      </PageHeader>

      {/* ── Workflow / Architecture diagram ─────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel p-6">
        <div className="text-sm font-bold text-white mb-4">Model Architecture & Workflow</div>
        <div className="grid md:grid-cols-4 gap-3">
          {WORKFLOW.map((w, i) => {
            const Icon = w.icon;
            return (
              <div key={w.step} className="relative">
                {/* Connector arrow */}
                {i < WORKFLOW.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-2 -translate-y-1/2 z-10 text-slate-700">
                    <ArrowRight size={14} aria-hidden="true" />
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl p-4 h-full"
                  style={{ background: `${w.color}08`, border: `1px solid ${w.color}18` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${w.color}15`, border: `1px solid ${w.color}25` }}>
                      <Icon size={15} style={{ color: w.color }} aria-hidden="true" />
                    </div>
                    <span className="text-[10px] font-mono font-bold" style={{ color: w.color }}>STEP {w.step}</span>
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">{w.title}</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">{w.desc}</div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Dataset stats ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} h="h-28" />)}
        </div>
      ) : error ? (
        <div className="panel p-4 flex items-center gap-3 text-sm"
          style={{ background: 'rgba(251,113,133,0.07)', borderColor: 'rgba(251,113,133,0.2)' }}>
          <AlertTriangle size={16} className="text-rose-400" aria-hidden="true" />
          <span className="text-slate-400">Could not load ML data: {error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricBadge label="Training Records" value={fmtInt(info?.n_train)} color="#a78bfa"
            sub={`From ${fmtInt(totalRecords)} total archive detections`} />
          <MetricBadge label="Test Records (2025+)" value={fmtInt(info?.n_test)} color="#22d3ee"
            sub="Time-aware temporal split" />
          <MetricBadge label="FRP log-R²" value={fmtNum(reg?.r2_log, 4)} color="#34d399"
            unit="LightGBM regressor" sub={`MAE: ${fmtNum(reg?.mae_mw)} MW`} />
          <MetricBadge label="Severity Accuracy" value={fmtPct(clf?.accuracy)}
            color="#fbbf24" unit="XGBoost classifier" sub="4-class: Low/Med/High/Extreme" />
        </div>
      )}

      {/* ── Training info banner ────────────────────────────────────────── */}
      {info && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="panel p-4 grid md:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <div className="text-slate-500 uppercase tracking-widest text-[10px] mb-2">Dataset</div>
            <div className="text-slate-300">{info.data_source || 'Not available'}</div>
            <div className="text-slate-500 mt-1">{info.date_range?.[0] ?? '—'} → {info.date_range?.[1] ?? '—'}</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase tracking-widest text-[10px] mb-2">Algorithms</div>
            <div className="text-slate-300">FRP: {reg?.algorithm || 'Not available'} (log1p target)</div>
            <div className="text-slate-300">Severity: {clf?.algorithm || 'Not available'} (4-class)</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase tracking-widest text-[10px] mb-2">Validation</div>
            <div className="text-slate-300">Temporal split: train &lt;2025</div>
            <div className="text-slate-300">Test: 2025–2026 detections</div>
          </div>
        </motion.div>
      )}

      {/* ── Regional predictions + feature importance ────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel p-5">
          <div className="text-sm font-bold text-white mb-0.5">Regional FRP Predictions</div>
          <div className="text-xs text-slate-500 mb-4 font-mono">Model inference on 15 Indian fire regions</div>

          <div className="flex gap-2 mb-4 flex-wrap">
            <ChipGroup label="Filter by season">
              {['winter','summer','post_monsoon','monsoon'].map(s => (
                <ToggleChip key={s} active={season === s} onClick={() => setSeason(s)} accent="violet">
                  {s.replace('_',' ')}
                </ToggleChip>
              ))}
            </ChipGroup>
          </div>
          <div className="flex gap-2 mb-4">
            <ChipGroup label="Filter by brightness">
              {['low','medium','high','extreme'].map(b => (
                <ToggleChip key={b} active={brightnessLevel === b} onClick={() => setBrightnessLevel(b)} accent="amber">
                  {b}
                </ToggleChip>
              ))}
            </ChipGroup>
          </div>

          {loading ? <Skeleton h="h-64" /> : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {topPreds.map((p, i) => (
                <motion.div key={p.region} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{ background: severityBg(p.severity), border: `1px solid ${severityColor(p.severity)}20` }}>
                  <div className="w-1.5 h-8 rounded-full shrink-0" style={{ background: severityColor(p.severity) }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">{p.region}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{p.lat.toFixed(1)}°N {p.lon.toFixed(1)}°E</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black font-mono" style={{ color: severityColor(p.severity) }}>
                      {p.frp_predicted.toFixed(1)} MW
                    </div>
                    <div className="text-[10px] font-mono" style={{ color: severityColor(p.severity) }}>
                      {p.severity_label}
                    </div>
                  </div>
                </motion.div>
              ))}
              {topPreds.length === 0 && (
                <div className="text-slate-600 text-sm text-center py-8">No predictions for this combination</div>
              )}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="panel p-5">
          <div className="text-sm font-bold text-white mb-0.5">Feature Importance — FRP Regressor</div>
          <div className="text-xs text-slate-500 mb-4 font-mono">
            {info?.frp_regressor?.algorithm} gain importance (top 8 features)
          </div>
          {loading ? <Skeleton h="h-64" /> : (
            <div role="img" aria-label="Horizontal bar chart showing top 8 feature importances for the FRP LightGBM regressor">
              <div style={{ width: '100%', minHeight: 220, height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureImportance} layout="vertical" margin={{ left: 60, right: 20, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} unit="%" />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={58} />
                    <Tooltip {...tooltipStyle} formatter={v => [`${v}%`, 'Importance']} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {featureImportance.map((_, i) => (
                        <Cell key={i} fill={`rgba(167,139,250,${0.9 - i * 0.09})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Classifier importance + model card ─────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="panel p-5">
          <div className="text-sm font-bold text-white mb-0.5">Feature Importance — Severity Classifier</div>
          <div className="text-xs text-slate-500 mb-4 font-mono">
            {info?.severity_classifier?.algorithm} gain importance (4-class: Low/Med/High/Extreme)
          </div>
          {loading ? <Skeleton h="h-52" /> : (
            <div role="img" aria-label="Horizontal bar chart showing top 8 feature importances for the XGBoost severity classifier">
              <div style={{ width: '100%', minHeight: 200, height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clsImportance} layout="vertical" margin={{ left: 60, right: 20, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} unit="%" />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={58} />
                    <Tooltip {...tooltipStyle} formatter={v => [`${v}%`, 'Importance']} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {clsImportance.map((_, i) => (
                        <Cell key={i} fill={`rgba(251,191,36,${0.9 - i * 0.09})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="panel p-5 space-y-4">
          <div className="text-sm font-bold text-white">Model Architecture</div>
          {info && (
            <div className="space-y-3 text-xs">
              {[
                {
                  label: 'FRP Regressor',
                  icon: TrendingUp,
                  color: '#a78bfa',
                  rows: [
                    ['Algorithm', reg?.algorithm],
                    ['Target', 'log₁₊(FRP) → MW'],
                    ['Features', data?.feature_columns?.length ? `${data.feature_columns.length} engineered` : '—'],
                    ['RMSE', reg?.rmse_mw != null ? `${fmtNum(reg.rmse_mw)} MW` : '—'],
                    ['MAE', reg?.mae_mw != null ? `${fmtNum(reg.mae_mw)} MW` : '—'],
                    ['R² (log)', fmtNum(reg?.r2_log, 4)],
                    ['R² (real)', fmtNum(reg?.r2, 4)],
                  ]
                },
                {
                  label: 'Severity Classifier',
                  icon: Zap,
                  color: '#fbbf24',
                  rows: [
                    ['Algorithm', clf?.algorithm],
                    ['Classes', '4 (Low/Med/High/Extreme)'],
                    ['Accuracy', fmtPct(clf?.accuracy)],
                    ['F1 (macro)', fmtNum(clf?.f1_macro, 3)],
                    ['Precision (macro)', fmtNum(clf?.precision_macro, 3)],
                    ['Validation', 'Temporal (2025–2026)'],
                  ]
                }
              ].map(({ label, icon: Icon, color, rows }) => (
                <div key={label} className="rounded-xl p-3" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Icon size={13} style={{ color }} aria-hidden="true" />
                    <span className="font-semibold" style={{ color }}>{label}</span>
                  </div>
                  <div className="space-y-1">
                    {rows.map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[11px]">
                        <span className="text-slate-500">{k}</span>
                        <span className="text-slate-300 font-mono">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Severity distribution ───────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="panel p-5">
        <div className="text-sm font-bold text-white mb-0.5">Severity Distribution Across Regions</div>
        <div className="text-xs text-slate-500 mb-4 font-mono">
          {season.replace('_',' ')} season · {brightnessLevel} brightness — predicted severity breakdown
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Low','Medium','High','Extreme'].map((cls, idx) => {
            const count = topPreds.filter(p => p.severity === idx).length;
            const pct = topPreds.length ? Math.round((count / topPreds.length) * 100) : 0;
            const color = severityColor(idx);
            return (
              <div key={cls} className="rounded-xl p-4 text-center" style={{ background: severityBg(idx), border: `1px solid ${color}20` }}>
                <div className="text-2xl font-black font-mono" style={{ color }}>{count}</div>
                <div className="text-xs font-semibold mt-0.5" style={{ color }}>{cls}</div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">{pct}% of regions</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── CPCB PM2.5 Forecasting — Research MVP ─────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="panel p-6" style={{ borderColor: 'rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.03)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)' }}>
            <Microscope size={20} style={{ color: '#a78bfa' }} aria-hidden="true" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">CPCB PM2.5 Forecasting — Research MVP</div>
            <div className="text-xs text-slate-500 font-mono">Nehru Nagar, Delhi (DPCC) · Next-day PM2.5 daily mean · 15-min CPCB data (2019–2025)</div>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(13,134,222,0.08)', border: '1px solid rgba(13,134,222,0.15)' }}>
          <div className="text-[10px] font-mono text-sky-400 uppercase tracking-wider mb-2">Distinct from Fire AI above — this is ground-station PM2.5 forecasting</div>
          <div className="text-xs text-slate-400 leading-relaxed">
            The models below are trained <strong>exclusively</strong> on Nehru Nagar, Delhi (DPCC) CPCB 15-minute PM2.5 observations
            (2,527 daily means, 2019-01-08 to 2025-12-31). They do <strong>not</strong> generalize to other stations or cities.
            No India-wide PM2.5 model exists in this build.
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="panel p-4 relative overflow-hidden" style={{ borderColor: 'rgba(167,139,250,0.2)' }}>
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full pointer-events-none" style={{ background: 'rgba(167,139,250,0.1)', filter: 'blur(12px)' }} />
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Station</div>
            <div className="text-sm font-bold text-white">Nehru Nagar, Delhi</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">DPCC · 28.68°N, 77.23°E</div>
          </div>
          <div className="panel p-4 relative overflow-hidden" style={{ borderColor: 'rgba(167,139,250,0.2)' }}>
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full pointer-events-none" style={{ background: 'rgba(167,139,250,0.1)', filter: 'blur(12px)' }} />
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Target</div>
            <div className="text-sm font-bold text-white">Next-day PM2.5 daily mean</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">Unit: µg/m³</div>
          </div>
          <div className="panel p-4 relative overflow-hidden" style={{ borderColor: 'rgba(167,139,250,0.2)' }}>
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full pointer-events-none" style={{ background: 'rgba(167,139,250,0.1)', filter: 'blur(12px)' }} />
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Training Data</div>
            <div className="text-sm font-bold text-white">2,527 daily observations</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">2019-01-08 → 2025-12-31</div>
          </div>
          <div className="panel p-4 relative overflow-hidden" style={{ borderColor: 'rgba(167,139,250,0.2)' }}>
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full pointer-events-none" style={{ background: 'rgba(167,139,250,0.1)', filter: 'blur(12px)' }} />
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Models</div>
            <div className="text-sm font-bold text-white">LightGBM + LSTM (PyTorch)</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">Lookback: 14 days</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="panel p-4" style={{ borderColor: 'rgba(167,139,250,0.2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Brain size={14} className="text-violet-400" aria-hidden="true" />
              <span className="text-xs font-semibold text-violet-300">LightGBM Prediction</span>
            </div>
            <Pm25ForecastDisplay modelName="lightgbm" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="panel p-4" style={{ borderColor: 'rgba(251,191,36,0.2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-amber-400" aria-hidden="true" />
              <span className="text-xs font-semibold text-amber-300">LSTM Prediction</span>
            </div>
            <Pm25ForecastDisplay modelName="lstm" />
          </motion.div>
        </div>

        <details className="panel p-4">
          <summary className="text-xs font-semibold cursor-pointer list-none flex items-center gap-1.5 text-sky-400">
            Benchmark Metrics (Test Set, 2025+)
            <ChevronDown size={12} className="chev-details" aria-hidden="true" />
          </summary>
          <div className="mt-4 space-y-2 text-xs font-mono">
            {Object.entries(getBenchmarkMetrics()).map(([key, m]) => (
              <div key={key} className="flex justify-between py-1.5 border-t" style={{ borderColor: 'rgba(148,163,184,0.1)' }}>
                <span className="text-slate-400">{m.label}</span>
                <span className="text-slate-300">
                  MAE: {m.MAE?.toFixed(2)} µg/m³{m.RMSE ? ` · RMSE: ${m.RMSE.toFixed(2)}` : ''}{m.R2 ? ` · R²: ${m.R2.toFixed(4)}` : ''}
                </span>
              </div>
            ))}
            <div className="pt-2 text-[10px] text-slate-500">
              Persistence = tomorrow ≈ today. Linear Regression = OLS on engineered features.
              LightGBM = gradient boosting (300 estimators). LSTM = 64-unit recurrent (14-day lookback).
              All metrics on chronological test split (2025+), never fabricated.
            </div>
          </div>
        </details>

        <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.15)' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={13} className="text-rose-400" aria-hidden="true" />
            <span className="text-xs font-semibold text-rose-300">Important Limitations</span>
          </div>
          <ul className="text-[10px] text-slate-500 space-y-1 list-disc list-inside">
            <li>Models support <strong>ONLY</strong> Nehru Nagar, Delhi (DPCC)</li>
            <li>No predictions generated for other stations — shows "Forecast unavailable"</li>
            <li>Training data: 15-min CPCB → daily mean (min 18 valid obs/day)</li>
            <li>Features: lags [1,2,3,7], rolling mean [3,7], rolling std [7], dow, month (10 total)</li>
            <li>LSTM: StandardScaler fit on train only; lookback = 14 days</li>
          </ul>
        </div>
      </motion.div>

      {/* ── Methodology note ────────────────────────────────────────────── */}
      <div className="panel p-4 text-[11px] font-mono leading-relaxed"
        style={{ color: '#475569', borderColor: 'rgba(167,139,250,0.12)' }}>
        <span className="text-violet-400 font-semibold">Methodology: </span>
        Models trained on {info?.n_train != null ? fmtInt(info.n_train) : 'a sampled subset of'} VIIRS fire pixel records{info?.total_records_in_dataset != null ? ` (from ${fmtInt(info.total_records_in_dataset)} total archive detections)` : ''}.
        Temporal train/test split: train on 2012–2024, test on 2025–2026.
        Features include brightness temperatures, spatial coordinates, seasonal cyclical encoding, pixel geometry, and confidence level.
        FRP is log₁₊-transformed before training to handle right-skewed distribution.
        All metrics computed on real held-out data — no fabricated values.
        Dataset: NASA FIRMS VIIRS S-NPP Collection 2 (India, 68°E–97°E, 8°N–37°N).
      </div>
    </div>
  );
}

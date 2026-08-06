import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Flame, RefreshCw, TriangleAlert as AlertTriangle, Satellite } from 'lucide-react';
import FireMap from '../components/map/FireMap';
import PageHeader from '../components/ui/PageHeader';
import { ChipGroup, ToggleChip } from '../components/ui/Chip';
import { StatusBadge } from '../components/ui/Badge';
import MethodologyNote from '../components/ui/MethodologyNote';
import { fetchNASAFIRMS } from '../utils/api';
import { getFireEventsForYear } from '../utils/timelineUtils';
import { ErrorBanner, ModeledDataBanner, PanelTitle } from '../components/ui/Shared';

const SOURCE_OPTIONS = [
  { id: 'MODIS_NRT', label: 'MODIS NRT', desc: 'Terra/Aqua ~1km' },
  { id: 'VIIRS_NOAA20_NRT', label: 'VIIRS NOAA-20', desc: '375m resolution' },
  { id: 'VIIRS_SNPP_NRT', label: 'VIIRS S-NPP', desc: '375m resolution' },
];

export default function FirePage({ selectedYear = 'Live' }) {
  const [liveFires, setLiveFires] = useState([]);
  const [source, setSource] = useState('MODIS_NRT');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadFires = useCallback(async () => {
    if (selectedYear !== 'Live') return;
    setStatus('loading');
    const result = await fetchNASAFIRMS({ source, days: 1 });
    if (result.error) {
      setStatus(result.error.includes('not configured') ? 'no-key' : 'error');
      setError(result.error);
    } else {
      setLiveFires(result.fires || []);
      setStatus('live');
      setLastUpdated(new Date());
      setError(null);
    }
  }, [selectedYear, source]);

  useEffect(() => { loadFires(); }, [loadFires]);

  const historicalFires = getFireEventsForYear(selectedYear);
  const fires = selectedYear === 'Live' && status === 'live' && liveFires.length > 0
    ? liveFires
    : historicalFires;

  const cropCount = fires.filter(f => f.type === 'Crop Residue').length;
  const forestCount = fires.filter(f => f.type === 'Forest Fire').length;
  const agriCount = fires.filter(f => f.type === 'Agricultural').length;
  const highFRP = fires.filter(f => f.frp >= 100).length;
  const showMapSkeleton = selectedYear === 'Live' && status === 'loading' && liveFires.length === 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        eyebrow={`Thermal Anomalies — ${selectedYear === 'Live' ? 'NASA FIRMS Live' : `${selectedYear} Historical`}`}
        title="Active Fire Radiative Power (FRP)"
        description={selectedYear === 'Live'
          ? 'Real fire detections from NASA FIRMS MODIS/VIIRS. Updated every 3 hours.'
          : `Scaled fire event estimates for ${selectedYear}. Pre-satellite era uses reduced density.`}
        accent="amber"
      >
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          <StatusBadge tone={status === 'live' ? 'live' : status === 'loading' ? 'loading' : 'error'} pulse={status === 'live'}>
            {status === 'live' ? <Flame size={10} aria-hidden="true" /> : status === 'loading' ? <RefreshCw size={10} className="animate-spin" aria-hidden="true" /> : null}
            {fires.length} anomalies
          </StatusBadge>
          {selectedYear === 'Live' && (
            <button onClick={loadFires} disabled={status === 'loading'} aria-label="Refresh fire data"
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all disabled:opacity-40">
              <RefreshCw size={14} className={status === 'loading' ? 'animate-spin' : ''} aria-hidden="true" />
            </button>
          )}
        </div>
      </PageHeader>

      {/* Source selector — live mode only */}
      {selectedYear === 'Live' && (
        <ChipGroup label="Satellite data source">
          {SOURCE_OPTIONS.map(opt => (
            <ToggleChip key={opt.id} active={source === opt.id} onClick={() => setSource(opt.id)} accent="amber">
              <Satellite size={10} aria-hidden="true" />
              <span>{opt.label}</span>
              <span className="text-[10px] opacity-60">{opt.desc}</span>
            </ToggleChip>
          ))}
        </ChipGroup>
      )}

      {selectedYear !== 'Live' && <ModeledDataBanner />}

      {error && selectedYear === 'Live' && (
        <ErrorBanner
          message={error.includes('not configured')
            ? 'NASA FIRMS API key required. Set VITE_NASA_FIRMS_MAP_KEY in .env. Showing reference data.'
            : `${error} — Showing reference data.`}
          onRetry={() => loadFires()}
        />
      )}

      {lastUpdated && status === 'live' && (
        <div className="text-[10px] font-mono text-slate-600">
          NASA FIRMS · {source} · Fetched: {lastUpdated.toLocaleTimeString('en-IN')} IST · Coverage: India (68°E–97°E, 8°N–37°N)
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-3 rounded-2xl overflow-hidden shadow-2xl relative"
          style={{ border: '1px solid rgba(245,158,11,0.15)' }}
        >
          {showMapSkeleton && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#050912] animate-pulse">
              <div className="flex flex-col items-center gap-3 text-slate-600">
                <RefreshCw size={22} className="animate-spin text-amber-500" aria-hidden="true" />
                <span className="text-xs font-mono">Connecting to NASA FIRMS…</span>
              </div>
            </div>
          )}
          <FireMap fires={fires} selectedYear={selectedYear} />
        </motion.div>

        <div className="flex flex-col gap-4">
          <div className="panel panel-hover p-5">
            <PanelTitle title="Fire Classification" subtitle={selectedYear === 'Live' ? 'NASA FIRMS detections' : `Scaled for ${selectedYear}`} />
            <div className="space-y-3 text-xs">
              {[
                { label: 'Crop Residue', count: cropCount, color: '#fbbf24' },
                { label: 'Forest Fire', count: forestCount, color: '#f87171' },
                { label: 'Agricultural', count: agriCount, color: '#fb923c' },
                { label: 'High FRP (≥100)', count: highFRP, color: '#f43f5e' },
              ].map(({ label, count, color }) => (
                <motion.div
                  key={label}
                  whileHover={{ x: 2 }}
                  className="flex items-center justify-between rounded-xl p-3 transition-all"
                  style={{ background: `${color}08`, border: `1px solid ${color}15` }}
                >
                  <div className="font-medium text-slate-300">{label}</div>
                  <div className="text-xl font-black font-mono" style={{ color }}>{count}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <PanelTitle title="FRP Scale" />
            <div className="space-y-2 text-xs">
              {[
                { range: '< 50 MW', color: '#fbbf24', label: 'Low' },
                { range: '50–100 MW', color: '#fb923c', label: 'Moderate' },
                { range: '100–200 MW', color: '#f87171', label: 'High' },
                { range: '> 200 MW', color: '#f43f5e', label: 'Extreme' },
              ].map(({ range, color, label }) => (
                <div key={range} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} aria-hidden="true" />
                  <span className="text-slate-400 font-mono">{range}</span>
                  <span className="text-slate-600 ml-auto">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <PanelTitle title="Data Sources" />
            <div className="text-[11px] text-slate-500 font-mono leading-relaxed">
              {selectedYear === 'Live' ? (
                <>NASA FIRMS · {source}<br />MODIS MOD14 / VIIRS VNP14<br />3-hr composite · 375m–1km<br />India bbox: 68°E–97°E 8°N–37°N</>
              ) : (
                <>Historical fire index<br />Scaled from 2026 FIRMS baseline<br />Pre-2000: ATSR/TRMM proxies<br />Modeled — not observed</>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Wifi, WifiOff, TriangleAlert as AlertTriangle, Flame, MapPin, ChevronDown } from 'lucide-react';
import AQIMap from '../components/map/AQIMap';
import FireMap from '../components/map/FireMap';
import PageHeader from '../components/ui/PageHeader';
import { ChipGroup, ToggleChip } from '../components/ui/Chip';
import { StatusBadge } from '../components/ui/Badge';
import MethodologyNote from '../components/ui/MethodologyNote';
import { fetchWAQIMapFeed, fetchNASAFIRMS } from '../utils/api';
import { aqiStations, fireEvents } from '../data/mockData';
import { useLocation } from '../context/LocationContext';

const FIRE_SOURCES = [
  { id: 'MODIS_NRT', label: 'MODIS' },
  { id: 'VIIRS_SNPP_NRT', label: 'VIIRS S-NPP' },
  { id: 'VIIRS_NOAA20_NRT', label: 'VIIRS NOAA-20' },
];

function ErrorBannerInline({ error }) {
  const isKey = error?.includes('not set') || error?.includes('not configured') || error?.includes('token');
  return (
    <div
      role="alert"
      className="mb-4 p-3 rounded-xl flex items-start gap-3 text-xs"
      style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)' }}
    >
      <AlertTriangle size={14} className="text-rose-400 mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        <div className="font-semibold mb-0.5" style={{ color: '#cc3f5d' }}>
          {isKey ? 'Data source not configured' : 'Data temporarily unavailable'}
        </div>
        <div style={{ color: 'var(--text-muted)' }}>
          {isKey
            ? 'Add the relevant API key to your .env file to enable current data. Showing reference records instead.'
            : `${error} — Showing reference records instead.`}
        </div>
      </div>
    </div>
  );
}

function AQIPanel({ explore = false }) {
  const { station } = useLocation();
  const [stations, setStations] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    const result = await fetchWAQIMapFeed();
    if (result.error) {
      setStatus('error');
      setError(result.error);
      setStations([]);
    } else {
      setStations(result.stations || []);
      setStatus('live');
      setLastUpdated(new Date());
      setError(null);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const display = status === 'live' && stations.length > 0 ? stations : aqiStations;
  const isReference = !(status === 'live' && stations.length > 0);
  const busy = status === 'loading' && stations.length === 0;

  return (
    <div className="flex flex-col gap-3" style={{ minHeight: '60vh' }}>
      {explore && (
        <div className="panel p-4 flex items-start gap-3 text-xs" style={{ borderColor: 'rgba(34,211,238,0.25)', background: 'rgba(34,211,238,0.06)' }}>
          <MapPin size={16} className="text-cyan-400 mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <div className="font-semibold mb-0.5" style={{ color: 'var(--text-main)' }}>Explore unmonitored locations</div>
            <div style={{ color: 'var(--text-muted)' }}>
              Select any location on the map to estimate PM2.5 using nearby monitoring stations.
              The result is a spatial estimate — not a direct monitoring-station measurement.
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-2">
          <StatusBadge tone={status === 'live' ? 'live' : status === 'loading' ? 'loading' : 'error'}>
            {status === 'live' ? <Wifi size={11} aria-hidden="true" /> : status === 'loading' ? <RefreshCw size={11} className="animate-spin" aria-hidden="true" /> : <WifiOff size={11} aria-hidden="true" />}
            <span>
              {status === 'live' ? `${display.length} stations` : isReference ? 'Reference stations' : 'Fetching…'}
            </span>
          </StatusBadge>
          {lastUpdated && status === 'live' && (
            <span className="font-mono">Updated {lastUpdated.toLocaleTimeString('en-IN')} IST</span>
          )}
        </div>
        <button
          onClick={load}
          disabled={status === 'loading'}
          aria-label="Refresh air quality map"
          className="p-2 rounded-lg hover:bg-cyan-400/10 hover:text-cyan-400 transition-colors disabled:opacity-40"
          style={{ color: 'var(--text-sub)' }}
        >
          <RefreshCw size={14} className={status === 'loading' ? 'animate-spin' : ''} aria-hidden="true" />
        </button>
      </div>

      {error && <ErrorBannerInline error={error} />}

      <div className="relative rounded-2xl overflow-hidden shadow-2xl flex-1" style={{ border: '1px solid var(--panel-border)', minHeight: 480 }}>
        {busy && (
          <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'var(--app-bg)' }}>
            <div className="flex flex-col items-center gap-3" style={{ color: 'var(--text-faint)' }}>
              <RefreshCw size={22} className="animate-spin text-cyan-400" aria-hidden="true" />
              <span className="text-xs font-mono">Loading stations…</span>
            </div>
          </div>
        )}
        <AQIMap stations={display} highlight={station} />
      </div>
      {isReference && (
        <p className="text-[11px] flex items-center gap-1.5" style={{ color: 'var(--text-faint)' }}>
          <MapPin size={12} aria-hidden="true" /> Reference station records are shown until current readings are available.
        </p>
      )}
    </div>
  );
}

function FiresPanel() {
  const [source, setSource] = useState('MODIS_NRT');
  const [fires, setFires] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    const result = await fetchNASAFIRMS({ source, days: 1 });
    if (result.error) {
      setStatus('error');
      setError(result.error);
      setFires([]);
    } else {
      setFires(result.fires || []);
      setStatus('live');
      setLastUpdated(new Date());
      setError(null);
    }
  }, [source]);

  useEffect(() => { load(); }, [load]);

  const display = status === 'live' && fires.length > 0 ? fires : fireEvents;
  const isReference = !(status === 'live' && fires.length > 0);
  const busy = status === 'loading' && fires.length === 0;

  const crop = display.filter(f => f.type === 'Crop Residue').length;
  const forest = display.filter(f => f.type === 'Forest Fire').length;

  return (
    <div className="flex flex-col gap-3" style={{ minHeight: '60vh' }}>
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-2">
          <StatusBadge tone={status === 'live' ? 'live' : status === 'loading' ? 'loading' : 'error'}>
            <Flame size={11} aria-hidden="true" />
            <span>{display.length} fire reports</span>
          </StatusBadge>
          {lastUpdated && status === 'live' && <span className="font-mono">Updated {lastUpdated.toLocaleTimeString('en-IN')} IST</span>}
          <button
            onClick={load}
            disabled={status === 'loading'}
            aria-label="Refresh fire reports"
            className="p-2 rounded-lg hover:bg-amber-400/10 hover:text-amber-400 transition-colors disabled:opacity-40"
            style={{ color: 'var(--text-sub)' }}
          >
            <RefreshCw size={14} className={status === 'loading' ? 'animate-spin' : ''} aria-hidden="true" />
          </button>
        </div>
      </div>

      {error && <ErrorBannerInline error={error} />}

      <div className="relative rounded-2xl overflow-hidden shadow-2xl flex-1" style={{ border: '1px solid var(--panel-border)', minHeight: 480 }}>
        {busy && (
          <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'var(--app-bg)' }}>
            <div className="flex flex-col items-center gap-3" style={{ color: 'var(--text-faint)' }}>
              <RefreshCw size={22} className="animate-spin text-amber-400" aria-hidden="true" />
              <span className="text-xs font-mono">Loading fire reports…</span>
            </div>
          </div>
        )}
        <FireMap fires={display} />
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        <span>Crop residue: <strong style={{ color: 'var(--text-sub)' }}>{crop}</strong></span>
        <span>Forest: <strong style={{ color: 'var(--text-sub)' }}>{forest}</strong></span>
        {isReference && <span className="ml-auto font-mono" style={{ color: 'var(--text-faint)' }}>Reference records until recent reports are available</span>}
      </div>

      <details className="panel p-4">
        <summary className="text-xs font-semibold cursor-pointer list-none flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
          Fire data source
          <ChevronDown size={13} className="chev-details" aria-hidden="true" style={{ color: 'var(--text-muted)' }} />
        </summary>
        <div className="mt-3">
          <ChipGroup label="Satellite sensor">
            {FIRE_SOURCES.map(s => (
              <ToggleChip key={s.id} active={source === s.id} onClick={() => setSource(s.id)} accent="amber">
                {s.label}
              </ToggleChip>
            ))}
          </ChipGroup>
          <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--text-faint)' }}>
            Fire reports come from NASA FIRMS. Each option refers to a different satellite sensor; VIIRS captures smaller fires than MODIS.
          </p>
        </div>
      </details>
    </div>
  );
}

export default function MapPage() {
  const [mode, setMode] = useState('air');

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-4">
      <PageHeader
        eyebrow="Map"
        title="Air quality around you"
        description="Current air quality from monitoring stations and fire activity reported by NASA FIRMS, across the country."
        accent="sky"
      />

      <div className="mt-6 mb-4">
        <ChipGroup label="Map mode">
          <ToggleChip active={mode === 'air'} onClick={() => setMode('air')} accent="sky">
            Monitoring Stations
          </ToggleChip>
          <ToggleChip active={mode === 'explore'} onClick={() => setMode('explore')} accent="cyan">
            Explore Location
          </ToggleChip>
          <ToggleChip active={mode === 'fire'} onClick={() => setMode('fire')} accent="amber">
            Fire Intelligence
          </ToggleChip>
        </ChipGroup>
      </div>

      <motion.div key={mode} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {mode === 'air' && <AQIPanel />}
        {mode === 'explore' && <AQIPanel explore />}
        {mode === 'fire' && <FiresPanel />}
      </motion.div>

      <div className="mt-8">
        <MethodologyNote accent="sky">
          Station markers use the standard AQI colour scale. Fire markers show satellite-detected thermal anomalies with an intensity estimate.
          Current feeds come from WAQI and NASA FIRMS; when a data source is unavailable, clearly-labelled reference records are shown instead — nothing is invented.
          To explore an unmonitored location, switch to Explore Location and click anywhere on the map. The system estimates pollution using nearby station observations.
        </MethodologyNote>
      </div>
    </div>
  );
}

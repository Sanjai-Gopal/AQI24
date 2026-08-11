import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import AQIMap from '../components/map/AQIMap';
import PageHeader from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { fetchWAQIMapFeed } from '../utils/api';
import { aqiStations } from '../data/mockData';
import { getStationsForYear } from '../utils/timelineUtils';

export default function AQIMapPage({ selectedYear = 'Live' }) {
  const [liveStations, setLiveStations] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | live | error | no-key
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadLiveData = useCallback(async () => {
    if (selectedYear !== 'Live') return;
    setStatus('loading');
    const result = await fetchWAQIMapFeed();
    if (result.error) {
      const isNoKey = result.error.includes('not set') || result.error.includes('not configured');
      setStatus(isNoKey ? 'no-key' : 'error');
      setError(result.error);
    } else {
      setLiveStations(result.stations || []);
      setStatus('live');
      setLastUpdated(new Date());
      setError(null);
    }
  }, [selectedYear]);

  useEffect(() => { loadLiveData(); }, [loadLiveData]);

  // Determine which stations to show
  const historicalStations = getStationsForYear(selectedYear);
  const stations = selectedYear === 'Live' && status === 'live' && liveStations.length > 0
    ? liveStations
    : historicalStations;

  const liveCount = liveStations.filter(s => s.isLive).length;
  const showMapSkeleton = selectedYear === 'Live' && status === 'loading' && liveStations.length === 0;

  return (
    <div className="p-4 md:p-6 flex flex-col" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <PageHeader
        eyebrow={`AQI Telemetry — ${selectedYear === 'Live' ? 'Real-Time WAQI Feed' : `${selectedYear} Historical Model`}`}
        title="India Air Quality Index Map"
        description={selectedYear === 'Live'
          ? 'Live station data from WAQI global monitoring network. Station markers update every 5 minutes.'
          : `Historically modeled AQI estimates for ${selectedYear} based on CPCB baseline scaling.`}
        accent="cyan"
        className="mb-4"
      >
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          {selectedYear === 'Live' && (
            <>
              <StatusBadge tone={status === 'live' ? 'live' : status === 'loading' ? 'loading' : 'error'} pulse={status === 'live'}>
                {status === 'live' ? <Wifi size={11} aria-hidden="true" /> : status === 'loading' ? <RefreshCw size={11} className="animate-spin" aria-hidden="true" /> : <WifiOff size={11} aria-hidden="true" />}
                <span>{status === 'live' ? `${liveCount} live stations` : status === 'loading' ? 'Fetching…' : 'Offline'}</span>
              </StatusBadge>
              <button
                onClick={loadLiveData}
                disabled={status === 'loading'}
                aria-label="Refresh live AQI data"
                className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors disabled:opacity-40"
              >
                <RefreshCw size={14} className={status === 'loading' ? 'animate-spin' : ''} aria-hidden="true" />
              </button>
            </>
          )}
          {selectedYear !== 'Live' && (
            <StatusBadge tone="modeled">
              <AlertTriangle size={11} aria-hidden="true" />
              <span>Modeled data — {selectedYear}</span>
            </StatusBadge>
          )}
        </div>
      </PageHeader>

      {/* Error banner */}
      {error && selectedYear === 'Live' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mb-4 p-3 rounded-xl flex items-start gap-3 text-xs"
          style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)' }}
        >
          <AlertTriangle size={14} className="text-rose-400 mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <div className="font-semibold text-rose-300 mb-0.5">
              {error.includes('not set') || error.includes('not configured') ? 'API Key Required' : 'Live data unavailable'}
            </div>
            <div className="text-gray-400">
              {error.includes('not set') || error.includes('not configured')
                ? 'Set VITE_WAQI_API_TOKEN in your .env file (get a free key at aqicn.org/data-platform/token). Showing reference station data.'
                : `${error} — Showing reference station data.`}
            </div>
          </div>
        </motion.div>
      )}

      {lastUpdated && status === 'live' && (
        <div className="text-[10px] font-mono text-gray-600 mb-3">
          Last fetched: {lastUpdated.toLocaleTimeString('en-IN')} · Auto-refreshes every 5 min
        </div>
      )}

      <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl relative" style={{ border: '1px solid rgba(34,211,238,0.1)', minHeight: 500 }}>
        {showMapSkeleton && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#050912] animate-pulse">
            <div className="flex flex-col items-center gap-3 text-gray-600">
              <RefreshCw size={22} className="animate-spin text-cyan-500" aria-hidden="true" />
              <span className="text-xs font-mono">Connecting to WAQI network…</span>
            </div>
          </div>
        )}
        <AQIMap stations={stations} selectedYear={selectedYear} />
      </div>
    </div>
  );
}

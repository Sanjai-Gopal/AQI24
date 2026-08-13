import { useEffect, useState, useCallback, useMemo, useRef, memo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import { getAQIColor, getAQICategory, haversineKm } from '../../utils/aqiUtils';
import AQILegend from '../ui/AQILegend';
import { MapPanel, MapStyleSwitcher, MapCountBadge, MapCloseButton } from './MapUI';
import { Layers, Globe, Navigation, Map, Maximize2, X, Search, ChevronRight, Brain, Zap, AlertTriangle, CheckCircle, Compass, MapPin } from 'lucide-react';
import { fetchPm25Forecast, isNehruNagar, getUnsupportedMessage } from '../../services/pm25Service';

const STYLE_OPTIONS = [
  { key: 'street', Icon: Navigation, label: 'Street' },
  { key: 'satellite', Icon: Globe, label: 'Satellite' },
  { key: 'terrain', Icon: Layers, label: 'Terrain' },
  { key: 'dark', Icon: Map, label: 'Dark' },
];

const STATION_PROXIMITY_RADIUS = 15;
const IDW_MAX_RADIUS = 100;
const IDW_K = 5;

// Overlay cards are intentionally always-dark frosted panels with explicit light
// text so they stay readable in both the dark and the light (sky) themes.
const CARD_BG = 'rgba(8,13,24,0.96)';
const TX_TITLE = '#f1f5f9';
const TX_VAL = '#e2e8f0';
const TX_MUTED = '#94a3b8';
const TX_FAINT = '#64748b';

/**
 * Inverse Distance Weighting spatial estimate.
 *
 * Uses the SAME nearest-K stations for both the weighted sum and the weight
 * denominator (the previous version used all stations for the denominator,
 * which under-weighted the nearest observations).
 *
 * weight_i = 1 / distance_i^2
 * estimated = Σ(weight_i * pm25_i) / Σ(weight_i)
 */
function IDWEstimate(stations, lat, lng, maxRadius = IDW_MAX_RADIUS, k = IDW_K) {
  if (!Array.isArray(stations) || stations.length === 0) {
    return { estimated: null, nearestStations: [], stationCount: 0, insufficient: true, confidence: 'Low' };
  }

  const valid = stations.filter(s =>
    s &&
    s.lat != null && s.lng != null &&
    typeof s.pm25 === 'number' && isFinite(s.pm25) && s.pm25 > 0 &&
    s.aqi != null && s.aqi > 0
  );
  if (valid.length === 0) {
    return { estimated: null, nearestStations: [], stationCount: 0, insufficient: true, confidence: 'Low' };
  }

  const withDist = valid
    .map(s => ({ station: s, distance: haversineKm(lat, lng, s.lat, s.lng) }))
    .filter(x => x.distance <= maxRadius);

  if (withDist.length === 0) {
    return { estimated: null, nearestStations: [], stationCount: valid.length, insufficient: true, confidence: 'Low' };
  }

  const topK = withDist
    .sort((a, b) => a.distance - b.distance)
    .slice(0, Math.min(k, withDist.length));

  const weighted = topK.map(x => ({
    station: x.station,
    distance: x.distance,
    weight: x.distance === 0 ? 1e10 : 1 / (x.distance * x.distance),
  }));

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  if (totalWeight <= 0) {
    return {
      estimated: null,
      nearestStations: topK.map(x => ({ city: x.station.city || x.station.stationName, distance: Math.round(x.distance * 10) / 10, aqi: x.station.aqi, pm25: x.station.pm25 })),
      stationCount: topK.length,
      insufficient: true,
      confidence: 'Low',
    };
  }

  const weightedSum = weighted.reduce((sum, w) => sum + w.weight * w.station.pm25, 0);
  const estimated = weightedSum / totalWeight;

  const nearestStations = weighted.map(w => ({
    city: w.station.city || w.station.stationName,
    distance: Math.round(w.distance * 10) / 10,
    aqi: w.station.aqi,
    pm25: w.station.pm25,
  }));

  const avgDistance = nearestStations.reduce((s, w) => s + w.distance, 0) / nearestStations.length;

  let confidence = 'Low';
  if (topK.length >= 3 && topK[0].distance < 30) confidence = 'High';
  else if (topK.length >= 2 && topK[0].distance < 60) confidence = 'Moderate';

  return {
    estimated: Math.round(estimated * 10) / 10,
    nearestStations,
    avgDistance: Math.round(avgDistance * 10) / 10,
    stationCount: topK.length,
    totalValid: valid.length,
    insufficient: false,
    confidence,
  };
}

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (Array.isArray(center) && center.length === 2 && typeof zoom === 'number') {
      map.setView(center, zoom, { animate: true });
    }
  }, [map, center, zoom]);
  return null;
}

function MapResizer({ isFullscreen }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(t);
  }, [isFullscreen, map]);
  return null;
}

const TILES = {
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: 'Esri' },
  dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attr: 'CARTO' },
  street: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: 'OSM' },
  terrain: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', attr: 'Esri' },
};

function StationDetailCard({ station, onClose, forecast, loading }) {
  const color = getAQIColor(station.aqi);
  const isNN = isNehruNagar(station);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      role="region"
      aria-label={`${station.city || station.stationName} station details`}
      className="absolute top-16 right-3 z-[999] w-56 rounded-2xl shadow-2xl"
      style={{ background: CARD_BG, border: `1px solid ${color}40`, backdropFilter: 'blur(16px)' }}
    >
      <div className="p-4 relative">
        <MapCloseButton onClick={onClose} label="Close station details" />
        <div className="flex items-center justify-between mb-3 pr-7">
          <div>
            <div className="font-bold text-sm" style={{ color: TX_TITLE }}>{station.city || station.stationName}</div>
            <div className="text-xs font-mono" style={{ color }}>{getAQICategory(station.aqi)}</div>
          </div>
          <div className="text-3xl font-black font-mono" style={{ color }}>{station.aqi}</div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            ['PM2.5', station.pm25, 'µg/m³'],
            ['PM10', station.pm10, 'µg/m³'],
            ['NO₂', station.no2, 'µg/m³'],
            ['O₃', station.o3, 'µg/m³'],
            ['CO', station.co, 'mg/m³'],
            ['SO₂', station.so2, 'µg/m³'],
            ['Temp', station.temperature, '°C'],
            ['Humidity', station.humidity, '%'],
          ].map(([label, val, unit]) => (
            <div key={label} className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-[10px] font-mono" style={{ color: TX_FAINT }}>{label}</div>
              <div className="font-bold font-mono" style={{ color: TX_VAL }}>{val ?? '—'}</div>
              <div className="text-[9px]" style={{ color: TX_FAINT }}>{unit}</div>
            </div>
          ))}
        </div>

        {station.dominantPollutant && (
          <div className="mt-2 text-[10px] font-mono" style={{ color: TX_FAINT }}>Dominant: {station.dominantPollutant.toUpperCase()}</div>
        )}

        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono">
          {station.isLive
            ? <><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" aria-hidden="true" /><span style={{ color: '#34d399' }}>Current WAQI reading</span></>
            : station.isModeled
            ? <><span className="w-1.5 h-1.5 bg-amber-400 rounded-full" aria-hidden="true" /><span style={{ color: '#fbbf24' }}>Modeled estimate</span></>
            : <><span className="w-1.5 h-1.5 bg-slate-500 rounded-full" aria-hidden="true" /><span style={{ color: TX_FAINT }}>Reference data</span></>
          }
        </div>

        {forecast && isNN && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={14} className="text-violet-400" aria-hidden="true" />
              <span className="text-xs font-semibold text-violet-300">AI Forecast Available</span>
              <CheckCircle size={10} className="text-emerald-400" aria-hidden="true" />
            </div>
            <div className="text-[10px] font-mono mb-3" style={{ color: TX_FAINT }}>
              Next-Day PM2.5 · Nehru Nagar, Delhi (DPCC)
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="rounded-xl p-3" style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}>
                <div className="text-[10px] font-mono text-violet-400">LightGBM</div>
                <div className="text-lg font-black font-mono text-violet-300">{forecast.lightgbm_prediction ?? '—'}</div>
                <div className="text-[9px]" style={{ color: TX_FAINT }}>µg/m³</div>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <div className="text-[10px] font-mono text-amber-400">LSTM</div>
                <div className="text-lg font-black font-mono text-amber-300">{forecast.lstm_prediction ?? '—'}</div>
                <div className="text-[9px]" style={{ color: TX_FAINT }}>µg/m³</div>
              </div>
            </div>
            <details className="text-[10px]" style={{ color: TX_FAINT }}>
              <summary className="cursor-pointer font-mono flex items-center gap-1">
                <Zap size={10} aria-hidden="true" />
                Benchmark metrics (test set)
              </summary>
              <div className="mt-2 space-y-1 font-mono">
                {Object.entries(forecast.model_metrics || {}).map(([key, m]) => (
                  <div key={key} className="flex justify-between">
                    <span>{m.label || key}</span>
                    <span style={{ color: TX_MUTED }}>
                      MAE: {m.MAE?.toFixed(2)} µg/m³{m.RMSE ? ` · RMSE: ${m.RMSE.toFixed(2)}` : ''}{m.R2 ? ` · R²: ${m.R2.toFixed(4)}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {forecast && !isNN && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-amber-400" aria-hidden="true" />
              <span className="text-xs font-semibold text-amber-300">Forecast Unavailable</span>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: TX_MUTED }}>
              {forecast.message}
            </p>
            <details className="mt-2 text-[10px]" style={{ color: TX_FAINT }}>
              <summary className="cursor-pointer font-mono flex items-center gap-1">
                <Zap size={10} aria-hidden="true" />
                Benchmark metrics (Nehru Nagar test set)
              </summary>
              <div className="mt-2 space-y-1 font-mono">
                {Object.entries(forecast.model_metrics || {}).map(([key, m]) => (
                  <div key={key} className="flex justify-between">
                    <span>{m.label || key}</span>
                    <span style={{ color: TX_MUTED }}>
                      MAE: {m.MAE?.toFixed(2)} µg/m³{m.RMSE ? ` · RMSE: ${m.RMSE.toFixed(2)}` : ''}{m.R2 ? ` · R²: ${m.R2.toFixed(4)}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {loading && !forecast && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-sky-400">
            <span className="animate-spin">⟳</span> Loading AI forecast…
          </div>
        )}
      </div>
    </motion.div>
  );
}

function LocationAnalysisCard({ pos, estimate }) {
  const nearest = estimate?.nearestStations?.[0];
  const nearLabel =
    nearest && nearest.distance < STATION_PROXIMITY_RADIUS
      ? `${nearest.city} — ${nearest.distance.toFixed(1)} km`
      : 'None nearby';

  return (
    <div
      className="absolute top-16 right-3 z-[999] w-64 rounded-2xl shadow-2xl"
      style={{ background: CARD_BG, border: '1px solid rgba(167,139,250,0.35)', backdropFilter: 'blur(16px)' }}
      role="region"
      aria-label="Location analysis"
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={14} className="text-amber-400" aria-hidden="true" />
          <span className="text-xs font-bold" style={{ color: TX_TITLE }}>LOCATION ANALYSIS</span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wide" style={{ color: TX_FAINT }}>Selected Location</div>
            <div className="font-mono" style={{ color: TX_VAL }}>{pos[0].toFixed(2)}°N, {pos[1].toFixed(2)}°E</div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-wide" style={{ color: TX_FAINT }}>Monitoring Station</div>
            <div className="font-mono" style={{ color: TX_VAL }}>{nearLabel}</div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-wide" style={{ color: TX_FAINT }}>Estimated PM2.5</div>
            {estimate?.insufficient ? (
              <div className="font-semibold" style={{ color: '#fbbf24' }}>No suitable monitoring stations found within the estimation radius.</div>
            ) : (
              <div className="font-black font-mono text-lg" style={{ color: '#fbbf24' }}>
                {estimate?.estimated != null ? `${estimate.estimated} µg/m³` : '—'}
              </div>
            )}
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-wide" style={{ color: TX_FAINT }}>Method</div>
            <div className="font-mono" style={{ color: TX_VAL }}>Inverse Distance Weighting (IDW)</div>
            <div className="font-mono text-[10px]" style={{ color: TX_FAINT }}>weight = 1 / distance²</div>
          </div>

          {!estimate?.insufficient && estimate?.nearestStations?.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wide mb-1" style={{ color: TX_FAINT }}>Nearest stations</div>
              <ul className="space-y-0.5 font-mono text-[10px]" style={{ color: TX_MUTED }}>
                {estimate.nearestStations.slice(0, 5).map((s, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="truncate pr-2">{`${i + 1}. ${s.city}`}</span>
                    <span>{s.distance} km</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!estimate?.insufficient && (
            <div className="flex flex-wrap gap-1 text-[10px] font-mono pt-1" style={{ color: TX_FAINT }}>
              <span>K nearest: {IDW_K}</span>
              <span>·</span>
              <span>Radius: {IDW_MAX_RADIUS} km</span>
              <span>·</span>
              <span>Confidence: {estimate?.confidence}</span>
            </div>
          )}

          <div className="pt-1 text-[9px] leading-snug" style={{ color: TX_FAINT }}>
            Spatial estimate from nearby monitoring stations — not a direct station measurement.
          </div>
        </div>
      </div>
    </div>
  );
}

function AQIMap({ stations = [], selectedYear = 'Live', highlight = null }) {
  const [selected, setSelected] = useState(null);
  const [filterMin, setFilterMin] = useState(0);
  const [mapStyle, setMapStyle] = useState('street');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(null);
  const [pm25Forecast, setPm25Forecast] = useState(null);
  const [pm25Loading, setPm25Loading] = useState(false);
  const [mapClickPos, setMapClickPos] = useState(null);
  const [showLocationAnalysis, setShowLocationAnalysis] = useState(false);
  const [locationEstimate, setLocationEstimate] = useState(null);
  const searchDebounceRef = useRef(null);

  const highlightMatch = useMemo(() => {
    if (!highlight) return null;
    if (!Array.isArray(stations) || stations.length === 0) return highlight;
    const q = String(highlight.city || '').toLowerCase();
    const m = stations.find(
      s => s.city?.toLowerCase().includes(q) || q.includes(String(s.city || '').toLowerCase())
    );
    return m || highlight;
  }, [highlight, stations]);

  useEffect(() => {
    setSelected(null);
    setShowLocationAnalysis(false);
    setMapClickPos(null);
    setLocationEstimate(null);
  }, [stations]);

  const initialCenter = useMemo(
    () => (highlightMatch ? [highlightMatch.lat, highlightMatch.lng] : [22.5, 82.0]),
    [highlightMatch]
  );
  const initialZoom = highlightMatch ? 6 : 5;

  const filtered = stations.filter(s =>
    s.aqi >= filterMin &&
    (debouncedSearchQuery === '' || s.city?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
  );

  const handleCitySearch = useCallback((query) => {
    setSearchQuery(query);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearchQuery(query);
      if (query) {
        const match = stations.find(s => s.city?.toLowerCase().startsWith(query.toLowerCase()));
        if (match) { setMapCenter([match.lat, match.lng]); setMapZoom(8); }
      } else {
        setMapCenter([22.5, 82.0]); setMapZoom(5);
      }
    }, 150);
  }, [stations]);

  const openHighlight = useCallback(() => {
    if (!highlightMatch) return;
    setMapCenter([highlightMatch.lat, highlightMatch.lng]);
    setMapZoom(9);
    setSelected(highlightMatch);
    setShowLocationAnalysis(false);
  }, [highlightMatch]);

  useEffect(() => {
    if (selected && isNehruNagar(selected)) {
      setPm25Loading(true);
      fetchPm25Forecast().then(data => {
        setPm25Forecast(data);
        setPm25Loading(false);
      });
    } else if (selected) {
      setPm25Forecast(getUnsupportedMessage());
      setPm25Loading(false);
    } else {
      setPm25Forecast(null);
      setPm25Loading(false);
    }
  }, [selected]);

  const tile = TILES[mapStyle];
  const hColor = highlightMatch ? getAQIColor(highlightMatch.aqi) : '#64748b';

  const handleMapClick = useCallback((e) => {
    const { lat, lng } = e.latlng;
    const nearStation = stations.find(s => {
      const d = haversineKm(lat, lng, s.lat, s.lng);
      return d < STATION_PROXIMITY_RADIUS;
    });

    if (nearStation) {
      setSelected(nearStation);
      setShowLocationAnalysis(false);
      setMapClickPos(null);
      return;
    }

    setSelected(null);
    setMapClickPos([lat, lng]);
    setLocationEstimate(IDWEstimate(stations, lat, lng, IDW_MAX_RADIUS, IDW_K));
    setShowLocationAnalysis(true);
  }, [stations]);

  return (
    <div
      className={`relative w-full ${isFullscreen ? 'h-screen' : 'h-[420px] sm:h-[500px] md:h-[580px]'} map-wrapper`}
      data-style={mapStyle}
    >
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ width: '100%', height: '100%', borderRadius: isFullscreen ? 0 : 16 }}
        zoomControl={false}
        attributionControl={false}
        onClick={handleMapClick}
      >
        <TileLayer key={mapStyle} url={tile.url} attribution={tile.attr} opacity={mapStyle === 'street' ? 0.9 : 1.0} />
        <ZoomControl position="bottomright" />
        <MapController center={mapCenter} zoom={mapZoom} />
        <MapResizer isFullscreen={isFullscreen} />

        {filtered.map(station => {
          const color = getAQIColor(station.aqi);
          const radius = Math.max(7, Math.min(26, station.aqi / 14));
          const isSelected = selected?.id === station.id;

          return (
            <CircleMarker
              key={station.id}
              center={[station.lat, station.lng]}
              radius={isSelected ? radius + 4 : radius}
              pathOptions={{
                fillColor: color,
                fillOpacity: mapStyle === 'satellite' ? 0.88 : 0.82,
                color: isSelected ? '#ffffff' : (mapStyle === 'satellite' ? 'rgba(255,255,255,0.6)' : color),
                weight: isSelected ? 2.5 : 1,
              }}
              eventHandlers={{ click: () => { setSelected(isSelected ? null : station); setShowLocationAnalysis(false); } }}
            >
              <Tooltip permanent={false} direction="top" offset={[0, -radius]} opacity={1}>
                <div style={{ background: '#0d1424', border: `1px solid ${color}40`, borderRadius: 10, padding: '8px 12px', minWidth: 110 }}>
                  <div style={{ color: '#e8edf5', fontWeight: 700, fontSize: 12 }}>{station.city || station.stationName}</div>
                  <div style={{ color, fontWeight: 800, fontSize: 20, fontFamily: 'monospace' }}>{station.aqi}</div>
                  <div style={{ color: '#64748b', fontSize: 10 }}>{getAQICategory(station.aqi)}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Top controls */}
      <div className="absolute top-3 left-3 right-3 z-[999] flex flex-wrap items-start justify-between gap-2 pointer-events-none">
        <MapPanel className="flex items-center gap-2 px-3 py-2 rounded-xl">
          <Search size={12} className="text-sky-500 flex-shrink-0" aria-hidden="true" />
          <label htmlFor="aqi-map-search" className="sr-only">Search by city name</label>
          <input
            id="aqi-map-search"
            value={searchQuery}
            onChange={e => handleCitySearch(e.target.value)}
            placeholder="Search a city…"
            className="bg-transparent text-[var(--text-main)] text-xs outline-none w-32 placeholder:text-slate-500"
          />
        </MapPanel>
        <div className="pointer-events-auto flex items-start gap-2">
          <MapStyleSwitcher options={STYLE_OPTIONS} value={mapStyle} onChange={setMapStyle} />
          <button
            className="pointer-events-auto w-8 h-8 rounded-xl flex items-center justify-center hover:text-cyan-400 transition-all shadow-lg bg-[#080d18]/90 border border-cyan-500/15 backdrop-blur-md"
            onClick={() => setIsFullscreen(f => !f)}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'View map fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <X size={13} aria-hidden="true" /> : <Maximize2 size={13} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Selected city card — the friendly first thing a visitor reads */}
      {highlightMatch && !showLocationAnalysis && (
        <div className="absolute top-16 left-3 z-[999] pointer-events-auto panel p-4 w-60">
          <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
            Selected location
          </div>
          <div className="mt-1 text-base font-bold" style={{ color: 'var(--text-main)' }}>
            {highlightMatch.city || highlightMatch.stationName || 'This city'}
          </div>
          <div className="mt-2 flex items-end gap-2">
            <div className="text-5xl font-black leading-none" style={{ color: hColor }}>
              {highlightMatch.aqi ?? '—'}
            </div>
            <div className="pb-1">
              <div className="text-sm font-bold" style={{ color: hColor }}>
                {getAQICategory(highlightMatch.aqi)}
              </div>
            </div>
          </div>
          <button
            onClick={openHighlight}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
          >
            View details <ChevronRight size={13} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Bottom-left: filter + legend */}
      <div className="absolute bottom-3 left-3 z-[999] flex flex-col gap-2 items-start">
        <MapPanel className="rounded-xl px-3 py-2.5">
          <label htmlFor="aqi-min-filter" className="block text-[10px] mb-1.5 uppercase tracking-wide" style={{ color: TX_MUTED }}>
            Show stations with AQI from <span className="text-sky-500 font-bold">{filterMin}</span>
          </label>
          <input
            id="aqi-min-filter"
            type="range" min={0} max={300} step={10} value={filterMin}
            onChange={e => setFilterMin(Number(e.target.value))}
            aria-valuetext={`Minimum AQI ${filterMin}`}
            className="w-28 accent-cyan-400" />
        </MapPanel>
        <AQILegend />
      </div>

      {/* Count badge */}
      <div className="absolute bottom-3 right-3 z-[999]">
        <MapCountBadge>
          <span className="text-cyan-400 font-bold">{filtered.length}</span>
          <span>/ {stations.length} stations</span>
        </MapCountBadge>
      </div>

      {/* Station detail card (single source) */}
      <AnimatePresence>
        {selected && (
          <StationDetailCard
            station={selected}
            onClose={() => setSelected(null)}
            forecast={pm25Forecast}
            loading={pm25Loading}
          />
        )}
      </AnimatePresence>

      {/* Location analysis card (unmonitored click) */}
      {showLocationAnalysis && mapClickPos && locationEstimate && (
        <LocationAnalysisCard pos={mapClickPos} estimate={locationEstimate} />
      )}
    </div>
  );
}

export default memo(AQIMap);

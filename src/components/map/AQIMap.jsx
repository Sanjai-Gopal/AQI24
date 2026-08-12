import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import { getAQIColor, getAQICategory } from '../../utils/aqiUtils';
import AQILegend from '../ui/AQILegend';
import { MapPanel, MapStyleSwitcher, MapCountBadge, MapCloseButton } from './MapUI';
import { Layers, Globe, Navigation, Map, Maximize2, X, Search, ChevronRight } from 'lucide-react';

const STYLE_OPTIONS = [
  { key: 'street', Icon: Navigation, label: 'Street' },
  { key: 'satellite', Icon: Globe, label: 'Satellite' },
  { key: 'terrain', Icon: Layers, label: 'Terrain' },
  { key: 'dark', Icon: Map, label: 'Dark' },
];

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

function AQIMap({ stations = [], selectedYear = 'Live', highlight = null }) {
  const [selected, setSelected] = useState(null);
  const [filterMin, setFilterMin] = useState(0);
  const [mapStyle, setMapStyle] = useState('street');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(null);

  // The city the user is currently watching. Prefer the real marker on the
  // map when one exists; otherwise fall back to the reference record.
  const highlightMatch = useMemo(() => {
    if (!highlight) return null;
    if (!Array.isArray(stations) || stations.length === 0) return highlight;
    const q = String(highlight.city || '').toLowerCase();
    const m = stations.find(
      s => s.city?.toLowerCase().includes(q) || q.includes(String(s.city || '').toLowerCase())
    );
    return m || highlight;
  }, [highlight, stations]);

  useEffect(() => { setSelected(null); }, [stations]);

  // Initial view: start on the selected city so the first thing people see
  // is "their" place, then keep the map stable afterwards.
  const initialCenter = useMemo(
    () => (highlightMatch ? [highlightMatch.lat, highlightMatch.lng] : [22.5, 82.0]),
    [highlightMatch]
  );
  const initialZoom = highlightMatch ? 6 : 5;

  const filtered = stations.filter(s =>
    s.aqi >= filterMin &&
    (searchQuery === '' || s.city?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCitySearch = useCallback((query) => {
    setSearchQuery(query);
    if (query) {
      const match = stations.find(s => s.city?.toLowerCase().startsWith(query.toLowerCase()));
      if (match) { setMapCenter([match.lat, match.lng]); setMapZoom(8); }
    } else {
      setMapCenter([22.5, 82.0]); setMapZoom(5);
    }
  }, [stations]);

  const openHighlight = useCallback(() => {
    if (!highlightMatch) return;
    setMapCenter([highlightMatch.lat, highlightMatch.lng]);
    setMapZoom(9);
    setSelected(highlightMatch);
  }, [highlightMatch]);

  const tile = TILES[mapStyle];
  const hColor = highlightMatch ? getAQIColor(highlightMatch.aqi) : '#64748b';

  const mapEl = (
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
      >
        <TileLayer key={mapStyle} url={tile.url} attribution={tile.attr} opacity={mapStyle === 'street' ? 0.9 : 1.0} />
        <ZoomControl position="bottomright" />
        <MapController center={mapCenter} zoom={mapZoom} />
        <MapResizer isFullscreen={isFullscreen} />

        {filtered.map((station) => {
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
              eventHandlers={{ click: () => setSelected(isSelected ? null : station) }}
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
            className="pointer-events-auto w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all shadow-lg bg-[#080d18]/90 border border-cyan-500/15 backdrop-blur-md"
            onClick={() => setIsFullscreen(f => !f)}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'View map fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <X size={13} aria-hidden="true" /> : <Maximize2 size={13} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Selected city card — the friendly first thing a visitor reads */}
      {highlightMatch && (
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
          <label htmlFor="aqi-min-filter" className="block text-[10px] text-slate-500 mb-1.5 uppercase tracking-wide">
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

      {/* Selected station panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            role="region"
            aria-label={`${selected.city || selected.stationName} station details`}
            className="absolute top-16 right-3 z-[999] w-56 rounded-2xl shadow-2xl"
            style={{ background: 'rgba(8,13,24,0.96)', border: `1px solid ${getAQIColor(selected.aqi)}30`, backdropFilter: 'blur(16px)' }}
          >
            <div className="p-4 relative">
              <MapCloseButton onClick={() => setSelected(null)} label="Close station details" />
              <div className="flex items-center justify-between mb-3 pr-7">
                <div>
                  <div className="text-white font-bold text-sm">{selected.city || selected.stationName}</div>
                  <div className="text-xs font-mono" style={{ color: getAQIColor(selected.aqi) }}>{getAQICategory(selected.aqi)}</div>
                </div>
                <div className="text-3xl font-black font-mono" style={{ color: getAQIColor(selected.aqi) }}>{selected.aqi}</div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  ['PM2.5', selected.pm25, 'µg/m³'],
                  ['PM10', selected.pm10, 'µg/m³'],
                  ['NO₂', selected.no2, 'µg/m³'],
                  ['O₃', selected.o3, 'µg/m³'],
                  ['CO', selected.co, 'mg/m³'],
                  ['SO₂', selected.so2, 'µg/m³'],
                  ['Temp', selected.temperature, '°C'],
                  ['Humidity', selected.humidity, '%'],
                ].map(([label, val, unit]) => (
                  <div key={label} className="rounded-lg p-2"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="text-slate-500 text-[10px] font-mono">{label}</div>
                    <div className="text-white font-bold font-mono">{val ?? '—'}</div>
                    <div className="text-slate-600 text-[9px]">{unit}</div>
                  </div>
                ))}
              </div>
              {selected.dominantPollutant && (
                <div className="mt-2 text-[10px] text-slate-500 font-mono">Dominant: {selected.dominantPollutant.toUpperCase()}</div>
              )}
              <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono">
                {selected.isLive
                  ? <><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" aria-hidden="true" /><span className="text-emerald-400">Current WAQI reading</span></>
                  : selected.isModeled
                  ? <><span className="w-1.5 h-1.5 bg-amber-400 rounded-full" aria-hidden="true" /><span className="text-amber-400">Modeled estimate</span></>
                  : <><span className="w-1.5 h-1.5 bg-slate-500 rounded-full" aria-hidden="true" /><span className="text-slate-500">Reference data</span></>
                }
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (isFullscreen) {
    return <div className="fixed inset-0 z-[2000]">{mapEl}</div>;
  }

  return mapEl;
}

export default memo(AQIMap);

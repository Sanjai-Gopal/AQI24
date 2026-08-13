import { useEffect, useState, useCallback, useMemo, memo, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import { getAQIColor, getAQICategory, getDistanceKm } from '../../utils/aqiUtils';
import AQILegend from '../ui/AQILegend';
import { MapPanel, MapStyleSwitcher, MapCountBadge, MapCloseButton } from './MapUI';
import { useLocation as useAppLocation } from '../../context/LocationContext';
import { Layers, Globe, Navigation, Map as MapIcon, Maximize2, X, Search, ChevronRight, MapPin, Loader2 } from 'lucide-react';

const STYLE_OPTIONS = [
  { key: 'street', Icon: Navigation, label: 'Street' },
  { key: 'satellite', Icon: Globe, label: 'Satellite' },
  { key: 'terrain', Icon: Layers, label: 'Terrain' },
  { key: 'dark', Icon: MapIcon, label: 'Dark' },
];

const TILES = {
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: 'Esri' },
  dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attr: 'CARTO' },
  street: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: 'OSM' },
  terrain: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', attr: 'Esri' },
};

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

function AQIMap({ stations = [], selectedYear = 'Live', highlight = null }) {
  const { selectCity, allStations, allCities } = useAppLocation();
  const [selected, setSelected] = useState(null);
  const [filterMin, setFilterMin] = useState(0);
  const [mapStyle, setMapStyle] = useState('street');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(null);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);

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

  const safeStations = Array.isArray(stations) ? stations : [];
  const displayed = useMemo(
    () => safeStations.filter(s => (Number(s.aqi) || 0) >= filterMin),
    [safeStations, filterMin]
  );

  const nearestStations = useCallback((target) => {
    if (!target || !Array.isArray(allStations)) return [];
    return allStations
      .filter(s => s.city !== target.city)
      .map(s => ({
        ...s,
        distance: getDistanceKm(target.lat, target.lng, s.lat, s.lng),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  }, [allStations]);

  const trimmed = searchQuery.trim();
  const q = trimmed.toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    return allCities
      .filter(c => c.toLowerCase().includes(q))
      .sort((a, b) => {
        const ai = a.toLowerCase().indexOf(q);
        const bi = b.toLowerCase().indexOf(q);
        if (ai !== bi) return ai - bi;
        return a.length - b.length;
      })
      .slice(0, 10);
  }, [allCities, q]);

  const showSearchOption = trimmed && !results.some(c => c.toLowerCase() === q);

  const selectResult = useCallback(async (cityName) => {
    setSearching(true);
    const resolved = await selectCity(cityName);
    setSearching(false);
    if (!resolved) return;
    setSearchQuery('');
    setSearchOpen(false);
    setMapCenter([resolved.lat, resolved.lng]);
    setMapZoom(resolved.isGeocoded ? 10 : 9);
    setSelected(resolved);
  }, [selectCity]);

  const openHighlight = useCallback(() => {
    if (!highlightMatch) return;
    setMapCenter([highlightMatch.lat, highlightMatch.lng]);
    setMapZoom(9);
    setSelected(highlightMatch);
  }, [highlightMatch]);

  // Close the search dropdown when clicking outside of it.
  useEffect(() => {
    if (!searchOpen) return;
    const handle = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [searchOpen]);

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

        {displayed.map((station) => {
          const color = getAQIColor(station.aqi);
          const radius = Math.max(7, Math.min(26, (Number(station.aqi) || 0) / 14));
          const isSelected = selected?.id === station.id;
          const key = station.id ?? `${station.lat}-${station.lng}`;

          return (
            <CircleMarker
              key={key}
              center={[station.lat, station.lng]}
              radius={isSelected ? radius + 4 : radius}
              pathOptions={{
                fillColor: color,
                fillOpacity: mapStyle === 'satellite' ? 0.88 : 0.82,
                color: isSelected ? '#ffffff' : (mapStyle === 'satellite' ? 'rgba(255,255,255,0.6)' : color),
                weight: isSelected ? 2.5 : 1,
              }}
              eventHandlers={{ click: () => { selectCity(station.city); setSelected(isSelected ? null : station); } }}
            >
              <Popup offset={[0, -radius]} autoPan={false} closeButton={false}>
                <div style={{ background: 'var(--card-bg-solid, #0d1424)', border: `1px solid ${color}40`, borderRadius: 10, padding: '8px 12px', minWidth: 110 }}>
                  <div style={{ color: 'var(--text-main, #e8edf5)', fontWeight: 700, fontSize: 12 }}>{station.city || station.stationName}</div>
                  <div style={{ color, fontWeight: 800, fontSize: 20, fontFamily: 'monospace' }}>{station.aqi ?? '—'}</div>
                  <div style={{ color: 'var(--text-muted, #64748b)', fontSize: 10 }}>{getAQICategory(station.aqi)}</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Top controls */}
      <div className="absolute top-3 left-3 right-3 z-[999] flex flex-wrap items-start justify-between gap-2 pointer-events-none">
        <div ref={searchRef} className="pointer-events-auto">
          <MapPanel className="flex flex-col gap-1 px-3 py-2.5 rounded-xl w-60 sm:w-72">
            <div className="flex items-center gap-2">
              <Search size={13} className="text-[var(--text-faint)] flex-shrink-0" aria-hidden="true" />
              <label htmlFor="aqi-map-search" className="sr-only">Search by city name</label>
              <input
                id="aqi-map-search"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search a city…"
                autoComplete="off"
                className="bg-transparent text-[var(--text-main)] text-xs outline-none w-full placeholder:text-[var(--text-faint)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                  aria-label="Clear search"
                  className="p-0.5 rounded-full text-[var(--text-faint)] hover:text-[var(--text-main)] hover:bg-[var(--text-main)]/10 transition-colors"
                >
                  <X size={13} aria-hidden="true" />
                </button>
              )}
            </div>

            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="border-t border-[var(--panel-border)] -mx-3 px-3 pt-2 mt-1"
                >
                  {results.length === 0 && !showSearchOption ? (
                    <div className="py-2 text-xs text-[var(--text-muted)]">
                      {trimmed ? 'No locations found' : 'Start typing a city name'}
                    </div>
                  ) : (
                    <ul role="listbox" aria-label="City results" className="max-h-48 overflow-y-auto -mx-3">
                      {showSearchOption && (
                        <li>
                          <button
                            type="button"
                            role="option"
                            onClick={() => selectResult(trimmed)}
                            disabled={searching}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-[var(--text-main)] hover:bg-[var(--brand-cyan)]/10 transition-colors disabled:opacity-60"
                          >
                            {searching ? (
                              <Loader2 size={12} className="text-[var(--text-faint)] shrink-0 animate-spin" aria-hidden="true" />
                            ) : (
                              <Search size={12} className="text-[var(--text-faint)] shrink-0" aria-hidden="true" />
                            )}
                            <span className="flex-1 truncate">Search for &ldquo;{trimmed}&rdquo;</span>
                          </button>
                        </li>
                      )}
                      {results.map((cityName) => {
                        const s = allStations.find(st => st.city === cityName);
                        return (
                          <li key={cityName}>
                            <button
                              type="button"
                              role="option"
                              onClick={() => selectResult(cityName)}
                              disabled={searching}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-[var(--text-main)] hover:bg-[var(--brand-cyan)]/10 transition-colors disabled:opacity-60"
                            >
                              <MapPin size={12} className="text-[var(--text-faint)] shrink-0" aria-hidden="true" />
                              <span className="flex-1 truncate">{cityName}</span>
                              {s && (
                                <span className="text-[10px] font-mono text-[var(--text-faint)]">
                                  AQI {s.aqi ?? '—'}
                                </span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </MapPanel>
        </div>

        <div className="pointer-events-auto flex items-start gap-2">
          <MapStyleSwitcher options={STYLE_OPTIONS} value={mapStyle} onChange={setMapStyle} />
          <MapPanel className="p-0 rounded-xl overflow-hidden">
            <button
              className="w-8 h-8 flex items-center justify-center text-[var(--text-faint)] hover:text-[var(--brand-cyan)] transition-all bg-transparent"
              onClick={() => setIsFullscreen(f => !f)}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'View map fullscreen'}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <X size={13} aria-hidden="true" /> : <Maximize2 size={13} aria-hidden="true" />}
            </button>
          </MapPanel>
        </div>
      </div>

      {/* Selected city card — the friendly first thing a visitor reads */}
      {highlightMatch && (
        <div className="absolute top-16 left-3 z-[999] pointer-events-auto panel p-4 w-60">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
            Selected location
          </div>
          <div className="mt-1 text-base font-bold text-[var(--text-main)]">
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
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-cyan)] hover:text-[var(--brand-cyan-d)] transition-colors"
          >
            View details <ChevronRight size={13} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Bottom-left: filter + legend */}
      <div className="absolute bottom-3 left-3 z-[999] flex flex-col gap-2 items-start">
        <MapPanel className="rounded-xl px-3 py-2.5">
          <label htmlFor="aqi-min-filter" className="block text-[10px] text-[var(--text-faint)] mb-1.5 uppercase tracking-wide">
            Show stations with AQI from <span className="text-[var(--brand-cyan)] font-bold">{filterMin}</span>
          </label>
          <input
            id="aqi-min-filter"
            type="range" min={0} max={300} step={10} value={filterMin}
            onChange={e => setFilterMin(Number(e.target.value))}
            aria-valuetext={`Minimum AQI ${filterMin}`}
            className="w-28 accent-[var(--brand-cyan)]" />
        </MapPanel>
        <AQILegend />
      </div>

      {/* Count badge */}
      <div className="absolute bottom-3 right-3 z-[999]">
        <MapCountBadge>
          <span className="text-[var(--brand-cyan)] font-bold">{displayed.length}</span>
          <span className="text-[var(--text-muted)]">/ {safeStations.length} stations</span>
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
            className="panel absolute top-16 right-3 z-[999] w-56 sm:w-64 max-h-[70vh] overflow-y-auto p-4 shadow-2xl"
            style={{ borderColor: `${getAQIColor(selected.aqi)}30` }}
          >
            <div className="relative">
              <MapCloseButton onClick={() => setSelected(null)} label="Close station details" />
              <div className="flex items-center justify-between mb-3 pr-7">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">Selected location</div>
                  <div className="text-[var(--text-main)] font-bold text-sm">{selected.city || selected.stationName}</div>
                  <div className="text-xs font-mono" style={{ color: getAQIColor(selected.aqi) }}>{getAQICategory(selected.aqi)}</div>
                </div>
                <div className="text-3xl font-black font-mono" style={{ color: getAQIColor(selected.aqi) }}>{selected.aqi ?? '—'}</div>
              </div>

              <div className="mb-3 p-2.5 rounded-lg text-[10px] font-mono" style={{ background: 'var(--text-main)', opacity: 0.03, border: '1px solid var(--panel-border)' }}>
                <div className="text-[var(--text-muted)] mb-0.5">Monitoring station status</div>
                {selected.isLive ? (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" aria-hidden="true" />
                    Observed at monitoring station
                  </div>
                ) : selected.isModeled ? (
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" aria-hidden="true" />
                    Estimated — no nearby station
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    <span className="w-1.5 h-1.5 bg-[var(--text-faint)] rounded-full" aria-hidden="true" />
                    Reference station data
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs mb-3">
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
                    style={{ background: 'var(--text-main)', opacity: 0.03, border: '1px solid var(--panel-border)' }}>
                    <div className="text-[var(--text-muted)] text-[10px] font-mono">{label}</div>
                    <div className="text-[var(--text-main)] font-bold font-mono">{val ?? '—'}</div>
                    <div className="text-[var(--text-faint)] text-[9px]">{unit}</div>
                  </div>
                ))}
              </div>

              <div className="mb-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)] mb-1.5">Method</div>
                <div className="text-xs text-[var(--text-main)]">
                  {selected.isLive
                    ? 'Direct station measurement'
                    : selected.isModeled
                    ? 'Nearby-station spatial estimation'
                    : 'Reference value from dataset'}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)] mb-1.5">Nearest stations</div>
                <ul className="space-y-1.5">
                  {nearestStations(selected).map((s) => (
                    <li key={s.city} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-main)]">{s.city}</span>
                      <span className="font-mono text-[var(--text-faint)]">{s.distance < 1 ? `${(s.distance * 1000).toFixed(0)} m` : `${s.distance.toFixed(1)} km`}</span>
                    </li>
                  ))}
                  {nearestStations(selected).length === 0 && (
                    <li className="text-xs text-[var(--text-muted)]">No other stations in reference dataset.</li>
                  )}
                </ul>
              </div>

              <div className="mb-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)] mb-1">Confidence</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {selected.isLive
                    ? 'High — direct measurement'
                    : selected.isModeled
                    ? 'Moderate — inferred from nearby stations'
                    : 'Low — reference value only'}
                </div>
              </div>

              {selected.dominantPollutant && (
                <div className="mt-2 text-[10px] text-[var(--text-muted)] font-mono">Dominant: {selected.dominantPollutant.toUpperCase()}</div>
              )}
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

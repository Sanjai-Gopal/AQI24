import { useEffect, useState, memo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import { getFireColor } from '../../utils/aqiUtils';
import { MapPanel, MapStyleSwitcher, MapCountBadge, MapCloseButton } from './MapUI';
import { Globe, Flame, Navigation, Map, ChevronDown } from 'lucide-react';

const FIRE_TYPES = ['All', 'Crop Residue', 'Forest Fire', 'Industrial', 'Agricultural'];

const STYLE_OPTIONS = [
  { key: 'satellite', Icon: Globe, label: 'Satellite' },
  { key: 'thermal', Icon: Flame, label: 'Thermal' },
  { key: 'dark', Icon: Map, label: 'Dark' },
  { key: 'street', Icon: Navigation, label: 'Street' },
];

const TILES = {
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: 'Esri' },
  thermal:   { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attr: 'CARTO' },
  dark:      { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attr: 'CARTO' },
  street:    { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: 'OSM' },
};

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [map, center, zoom]);
  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

// Confidence-based color modifier
function getConfidenceColor(confidence) {
  if (!confidence) return null;
  const c = typeof confidence === 'string' ? confidence.toLowerCase() : null;
  if (c === 'high' || (typeof confidence === 'string' && parseInt(confidence) >= 80)) return 'high';
  if (c === 'nominal' || (typeof confidence === 'string' && parseInt(confidence) >= 50)) return 'nominal';
  if (c === 'low') return 'low';
  return null;
}

function FireMap({ fires = [], selectedYear = 'Live' }) {
  const [selected, setSelected] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [mapStyle, setMapStyle] = useState('satellite');

  useEffect(() => { setSelected(null); }, [fires]);

  const safeFires = Array.isArray(fires) ? fires : [];
  const filtered = typeFilter === 'All'
    ? safeFires
    : safeFires.filter(f => f.type === typeFilter);

  const tile = TILES[mapStyle];

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] md:h-[560px] map-wrapper" data-style={mapStyle}>
      <MapContainer
        center={[24.0, 82.0]}
        zoom={5}
        style={{ width: '100%', height: '100%', borderRadius: '16px' }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer key={mapStyle} url={tile.url} attribution={tile.attr} opacity={mapStyle === 'street' ? 0.9 : 1.0} />
        <MapController center={[24.0, 82.0]} zoom={5} />
        <MapResizer />

        {filtered.map((f, i) => {
          const color = getFireColor(f.frp || 0);
          const r = Math.max(6, Math.min(22, (f.frp || 0) / 20));
          const key = f.id || `fire_${i}`;
          const confLevel = getConfidenceColor(f.confidence);
          // Confidence ring opacity
          const ringOpacity = confLevel === 'high' ? 0.9 : confLevel === 'nominal' ? 0.6 : 0.4;

          return (
            <CircleMarker
              key={key}
              center={[f.lat, f.lng]}
              radius={r}
              pathOptions={{
                fillColor: color,
                fillOpacity: mapStyle === 'thermal' ? 0.95 : 0.85,
                color: '#ffffff',
                weight: 0.8,
                opacity: ringOpacity,
              }}
              eventHandlers={{ click: () => setSelected(selected?.id === key ? null : { ...f, _key: key }) }}
            >
              <Tooltip>
                <div style={{ background: 'var(--card-bg-solid, #0d1424)', border: '1px solid rgba(251,146,60,0.25)', borderRadius: 10, padding: '8px 12px', color: 'var(--text-main, #e8edf5)' }}>
                  <div style={{ color: 'var(--brand-cyan, #fb923c)', fontWeight: 700, fontSize: 12 }}>{f.state || 'India'}</div>
                  <div style={{ color: '#fbbf24', fontFamily: 'monospace', fontWeight: 800, fontSize: 14 }}>FRP: {f.frp || 0} MW</div>
                  <div style={{ color: 'var(--text-muted, #64748b)', fontSize: 10 }}>{f.type || 'Fire detection'} · {f.source || 'MODIS/VIIRS'}</div>
                  {f.confidence && <div style={{ color: 'var(--text-muted, #64748b)', fontSize: 10 }}>Confidence: {f.confidence}%</div>}
                  {f.date && <div style={{ color: 'var(--text-muted, #64748b)', fontSize: 10 }}>{f.date} {f.time || ''}</div>}
                  {f.isModeled && <div style={{ color: '#fbbf24', fontSize: 9 }}>Reference estimate</div>}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Type filter chips */}
      <div role="group" aria-label="Filter by fire type" className="absolute top-3 left-3 z-[1000] flex flex-wrap gap-1.5 max-w-xs">
        {FIRE_TYPES.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            aria-pressed={typeFilter === t}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wide transition-all ${
              typeFilter === t
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-[var(--text-faint)] border border-[var(--panel-border)] bg-[var(--panel-bg)] hover:bg-[var(--panel-bg-solid)]'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Map style switcher */}
      <div className="absolute top-3 right-3 z-[1000]">
        <MapStyleSwitcher options={STYLE_OPTIONS} value={mapStyle} onChange={setMapStyle} />
      </div>

      {/* Legend */}
      <MapPanel className="absolute bottom-3 left-3 z-[1000] p-3.5 rounded-2xl text-xs w-48">
        <div className="text-[var(--text-faint)] font-bold font-mono mb-2 tracking-wide uppercase text-[10px]">Fire intensity</div>
        <div className="space-y-1.5 font-mono text-[11px]">
          {[['Mild','<50MW','#fbbf24'],['Moderate','50–100MW','#fb923c'],['High','100–200MW','#f87171'],['Extreme','>200MW','#f43f5e']].map(([l,r,c]) => (
            <div key={l} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c }} aria-hidden="true" />
              <span className="text-[var(--text-main)]">{l}</span>
              <span className="text-[var(--text-muted)] ml-auto text-[10px]">{r}</span>
            </div>
          ))}
        </div>
        {/* Confidence indicator */}
        <div className="mt-2 pt-2 border-t border-[var(--panel-border)]">
          <div className="text-[9px] text-[var(--text-muted)] font-mono mb-1">Confidence ring</div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--text-main)]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border-2 border-white/90" />High</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border-2 border-white/60" />Nominal</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border-2 border-white/40" />Low</span>
          </div>
        </div>
        <details className="mt-2 pt-2 border-t border-[var(--panel-border)] font-mono">
          <summary className="cursor-pointer list-none flex items-center justify-between text-[var(--text-muted)] text-[9px]">
            <span>Data source</span>
            <ChevronDown size={11} className="chev-details" aria-hidden="true" />
          </summary>
          <div className="text-[var(--text-muted)] text-[9px] pt-1.5 leading-relaxed">
            {selectedYear === 'Live'
              ? 'NASA FIRMS satellite detections (MODIS / VIIRS-SNPP / NOAA-20).'
              : `Reference records — ${selectedYear}.`}
          </div>
        </details>
      </MapPanel>

      {/* Count badge */}
      <div className="absolute bottom-3 right-3 z-[1000]">
        <MapCountBadge accent="#9ca3af">
          <span className="text-amber-400 font-black">{filtered.length}</span>
          <span className="text-slate-500">{filtered.length === safeFires.length ? 'events' : `/ ${safeFires.length} total`}</span>
        </MapCountBadge>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            role="region"
            aria-label={`${selected.state || 'India'} fire detection details`}
            className="absolute top-16 right-3 z-[1002] panel p-4 w-60 shadow-2xl backdrop-blur-lg rounded-2xl"
            style={{ background: 'var(--panel-bg-solid)', borderColor: `${getFireColor(selected.frp)}50` }}
          >
            <div className="relative pr-6">
              <MapCloseButton onClick={() => setSelected(null)} label="Close fire details" />
              <div className="font-extrabold text-[var(--text-main)] text-base tracking-tight">{selected.state || 'India'}</div>
              <div className="text-xs font-mono text-amber-400 font-bold mb-3">{selected.type || 'Fire detection'}</div>
            </div>
            <div className="space-y-2 text-xs border-t border-[var(--panel-border)] pt-2.5">
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">FRP</span><span className="text-amber-400 font-mono font-bold">{selected.frp || 0} MW</span></div>
              {selected.brightness && <div className="flex justify-between"><span className="text-[var(--text-muted)]">Brightness</span><span className="text-[var(--text-main)] font-mono">{selected.brightness} K</span></div>}
              {selected.confidence && <div className="flex justify-between"><span className="text-[var(--text-muted)]">Confidence</span><span className="text-[var(--text-main)] font-mono">{selected.confidence}%</span></div>}
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Source</span><span className="text-[var(--text-main)]">{selected.source || 'NASA FIRMS'}</span></div>
              {selected.date && <div className="flex justify-between"><span className="text-[var(--text-muted)]">Date</span><span className="text-[var(--text-main)] font-mono">{selected.date}</span></div>}
              {selected.isLive && <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" aria-hidden="true" />Current NASA FIRMS detection</div>}
              {selected.isModeled && <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-mono"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full" aria-hidden="true" />Reference estimate</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(FireMap);

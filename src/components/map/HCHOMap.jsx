import { useEffect, useState, memo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import { getHCHOColor, formatHCHO } from '../../utils/aqiUtils';
import { MapPanel, MapStyleSwitcher, MapCloseButton } from './MapUI';
import { Globe, Flame, Navigation, Map } from 'lucide-react';

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

function HCHOMap({ hotspots = [], selectedYear = 'Live' }) {
  const [selected, setSelected] = useState(null);
  const [mapStyle, setMapStyle] = useState('satellite');

  const safeHotspots = Array.isArray(hotspots) ? hotspots : [];

  useEffect(() => { setSelected(null); }, [hotspots]);

  const tile = TILES[mapStyle];

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] md:h-[560px] map-wrapper" data-style={mapStyle}>
      <MapContainer
        center={[22.5, 82.0]}
        zoom={5}
        style={{ width: '100%', height: '100%', borderRadius: '16px' }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer key={mapStyle} url={tile.url} attribution={tile.attr} opacity={mapStyle === 'street' ? 0.9 : 1.0} />
        <MapController center={[22.5, 82.0]} zoom={5} />
        <MapResizer />

        {safeHotspots.map((h, i) => {
          const color = getHCHOColor(h.intensity || 0.5);
          const baseRadius = Math.max(8, Math.min(40, 12 + (h.intensity || 0.5) * 20));
          const key = `hcho_${i}_${h.lat}_${h.lng}`;

          return (
            <CircleMarker
              key={key}
              center={[h.lat, h.lng]}
              radius={baseRadius}
              pathOptions={{
                fillColor: color,
                fillOpacity: mapStyle === 'thermal' ? 0.8 : 0.5,
                color: mapStyle === 'satellite' ? '#ffffff' : color,
                weight: mapStyle === 'satellite' ? 2 : 1.5,
                opacity: 0.75,
              }}
              eventHandlers={{ click: () => setSelected(selected === key ? null : { ...h, _key: key }) }}
            >
              <Tooltip>
                <div style={{ background: '#080d18', border: `1px solid ${color}40`, borderRadius: 10, padding: '8px 12px' }}>
                  <div style={{ color, fontWeight: 700, fontSize: 12 }}>{h.region}</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 14, color }}>
                    {formatHCHO(h.value)} mol/cm²
                  </div>
                  <div style={{ color: '#64748b', fontSize: 10 }}>Source: {h.source}</div>
                  {h.isModeled && <div style={{ color: '#f59e0b', fontSize: 9 }}>⚠ Modeled estimate</div>}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map style switcher */}
      <div className="absolute top-3 right-3 z-[1000]">
        <MapStyleSwitcher options={STYLE_OPTIONS} value={mapStyle} onChange={setMapStyle} />
      </div>

      {/* Legend with gradient bar */}
      <MapPanel className="absolute bottom-3 left-3 z-[1000] p-3.5 rounded-2xl text-xs w-52">
        <div className="text-slate-400 font-bold font-mono mb-2 tracking-wide uppercase text-[10px]">HCHO Column Intensity</div>
        {/* Gradient bar */}
        <div className="h-2 rounded-full mb-1.5" style={{
          background: 'linear-gradient(90deg, #22d3ee 0%, #fbbf24 25%, #fb923c 50%, #f87171 75%, #f43f5e 100%)'
        }} />
        <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-2">
          <span>Low</span>
          <span>Extreme</span>
        </div>
        <div className="space-y-1.5 font-mono text-[11px]">
          {[
            ['Low',     '<2.5×10¹⁵','#22d3ee'],
            ['Moderate','2.5–3.0','#fbbf24'],
            ['High',    '3.0–3.8','#fb923c'],
            ['V.High',  '3.8–4.3','#f87171'],
            ['Extreme', '>4.3×10¹⁵','#f43f5e'],
          ].map(([l,r,c]) => (
            <div key={l} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c }} aria-hidden="true" />
              <span className="text-slate-300">{l}</span>
              <span className="text-slate-500 ml-auto text-[10px]">{r}</span>
            </div>
          ))}
        </div>
        <div className="text-slate-600 mt-2 text-[9px] border-t border-white/5 pt-2 font-mono">
          {selectedYear === 'Live' ? 'Sensor: Sentinel-5P TROPOMI (reference)' : `Reference · ${selectedYear}`}
          <br />Units: molecules/cm²
        </div>
      </MapPanel>

      {/* Status badge */}
      <MapPanel className="absolute bottom-3 right-3 z-[1000] px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-2">
        {safeHotspots.length} hotspots
        {selectedYear === 'Live' ? ' · satellite reference' : ` · ${selectedYear}`}
      </MapPanel>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            role="region"
            aria-label={`${selected.region} HCHO hotspot details`}
            className="absolute top-16 right-3 z-[1002] bg-[#080d18]/95 border p-4 w-64 shadow-2xl backdrop-blur-md rounded-2xl"
            style={{ borderColor: `${getHCHOColor(selected.intensity || 0.5)}50` }}
          >
            <div className="relative pr-6">
              <MapCloseButton onClick={() => setSelected(null)} label="Close hotspot details" />
              <div className="font-extrabold text-white text-base tracking-tight mb-0.5">{selected.region}</div>
              <div className="text-xs font-mono font-bold mb-3" style={{ color: getHCHOColor(selected.intensity || 0.5) }}>
                {formatHCHO(selected.value)} mol/cm²
              </div>
            </div>
            <div className="space-y-2 text-xs border-y border-white/5 py-2.5">
              <div className="flex justify-between"><span className="text-slate-500">Source</span><span className="text-white">{selected.source}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Intensity</span><span className="text-white font-mono">{((selected.intensity || 0) * 100).toFixed(0)}% rel.</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Coords</span><span className="text-white font-mono">{selected.lat?.toFixed(2)}°N {selected.lng?.toFixed(2)}°E</span></div>
              {selected.isModeled && <div className="text-[10px] text-amber-400 font-mono">Reference estimate — not observed</div>}
            </div>
            <div className="text-[9px] text-slate-500 font-mono mt-2.5 leading-relaxed">
              HCHO is generated by VOC oxidation — a proxy for biomass burning and industrial emissions.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(HCHOMap);

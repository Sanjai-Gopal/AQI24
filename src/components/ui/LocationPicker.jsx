import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LocateFixed, Search, Check, Loader2, MapPin } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

const MAX_SUGGESTIONS = 200;

/**
 * Two-step location picker: "Use my location" or search a city.
 * Lives on the hero of the home page and the forecast page.
 */
export default function LocationPicker({ autoFocus = false }) {
  const { city, allCities, selectCity, useDeviceLocation, usingDeviceLocation, geoStatus } = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const inputRef = useRef(null);

  const trimmed = query.trim();
  const q = trimmed.toLowerCase();

  const filtered = useMemo(() => {
    if (!trimmed) return allCities.slice(0, MAX_SUGGESTIONS);
    const scored = allCities
      .map(c => {
        const idx = c.toLowerCase().indexOf(q);
        return { c, idx };
      })
      .filter(x => x.idx !== -1)
      .sort((a, b) => a.idx - b.idx || a.c.length - b.c.length)
      .map(x => x.c);
    return scored.slice(0, MAX_SUGGESTIONS);
  }, [allCities, q, trimmed]);

  const showSearchOption = trimmed && !filtered.some(c => c.toLowerCase() === q);

  const pick = async (c) => {
    setLocalLoading(true);
    const result = await selectCity(c);
    setLocalLoading(false);
    if (result) {
      setOpen(false);
      setQuery('');
    }
  };

  const openList = () => {
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-stretch justify-center">
        <button
          onClick={useDeviceLocation}
          disabled={geoStatus === 'loading'}
          aria-label="Use my current location"
          className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-slate-900 bg-gradient-to-r from-sky-300 to-sky-400 hover:from-sky-200 hover:to-sky-300 shadow-[0_8px_30px_rgba(56,189,248,0.18)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {geoStatus === 'loading' ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <LocateFixed size={16} aria-hidden="true" />
          )}
          {usingDeviceLocation ? 'Using your location' : 'Use my location'}
        </button>

        <button
          onClick={openList}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all border"
          style={{ color: 'var(--text-sub)', borderColor: 'var(--panel-border)', background: 'rgba(255,255,255,0.02)' }}
        >
          <Search size={16} className="text-sky-400" aria-hidden="true" />
          Search a city
        </button>
      </div>

      {geoStatus === 'error' && (
        <p className="mt-3 text-center text-xs" style={{ color: '#fbbf24' }} role="alert">
          We couldn&rsquo;t access your location. Please search for a city instead.
        </p>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.15 }}
            className="relative z-30"
            role="dialog"
            aria-label="Search cities"
          >
            <div className="panel absolute left-1/2 -translate-x-1/2 mt-3 w-full sm:w-[28rem] max-w-[calc(100vw-2rem)] overflow-hidden">
              <div className="p-3 border-b" style={{ borderColor: 'var(--panel-border)' }}>
                <div className="flex items-center gap-2 rounded-xl px-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(56,189,248,0.25)' }}>
                  <Search size={15} className="text-sky-400 shrink-0" aria-hidden="true" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Type a city name…"
                    aria-label="Search city"
                    className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-500"
                    style={{ color: 'var(--text-main)' }}
                  />
                </div>
              </div>
              <ul role="listbox" aria-label="City results" className="max-h-72 overflow-y-auto py-1.5">
                {filtered.length === 0 && !showSearchOption && (
                  <li className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>No cities match &ldquo;{query}&rdquo;.</li>
                )}
                {showSearchOption && (
                  <li>
                    <button
                      type="button"
                      role="option"
                      onClick={() => pick(trimmed)}
                      disabled={localLoading}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-sky-400/10 transition-colors disabled:opacity-60"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {localLoading ? (
                        <Loader2 size={13} className="text-sky-400 animate-spin" aria-hidden="true" />
                      ) : (
                        <Search size={13} className="text-sky-400" aria-hidden="true" />
                      )}
                      <span className="flex-1">Search for &ldquo;{trimmed}&rdquo;</span>
                    </button>
                  </li>
                )}
                {filtered.map(c => {
                  const active = c === city;
                  return (
                    <li key={c}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => pick(c)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-sky-400/10 transition-colors"
                        style={{ color: active ? '#22d3ee' : 'var(--text-main)' }}
                      >
                        <MapPin size={13} className={active ? 'text-sky-400' : 'text-slate-500'} aria-hidden="true" />
                        <span className="flex-1">{c}</span>
                        {active && <Check size={14} className="text-sky-400" aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

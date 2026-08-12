import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Trash2, Check, Plus, LogIn, ShieldCheck } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import { ChipGroup, ToggleChip } from '../components/ui/Chip';

const STORAGE_KEY = 'aqi24_saved_locations';

function readSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

export default function MyLocationsPage() {
  const { allCities, city, selectCity } = useLocation();
  const { isAuthenticated, configured } = useAuth();
  const [saved, setSaved] = useState(readSaved);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch { /* ignore */ }
  }, [saved]);

  const toggle = (c) => {
    setSaved(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const filtered = allCities.filter(c => !query.trim() || c.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-4">
      <PageHeader
        eyebrow="My Locations"
        title="Your saved places"
        description="Keep your most-watched cities close. Saved locations are remembered in this browser."
        accent="sky"
        className="mb-6"
      />

      {!isAuthenticated && (
        <div className="panel p-5 mb-5 text-xs leading-relaxed" style={{ borderColor: 'rgba(251,191,36,0.25)' }}>
          <div className="flex items-center gap-2 mb-1.5">
            {configured ? <LogIn size={14} className="text-amber-400" aria-hidden="true" /> : <ShieldCheck size={14} className="text-amber-400" aria-hidden="true" />}
            <span className="font-bold text-amber-300">{configured ? 'Sign in to sync' : 'Guest mode'}</span>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>
            {configured
              ? <>You&rsquo;re browsing as a guest — locations are stored in this browser only. <Link to="/login" className="text-sky-400 underline underline-offset-2">Sign in</Link> to keep them across devices.</>
              : <>Locations are stored in this browser only. <Link to="/login" className="text-sky-400 underline underline-offset-2">Learn more</Link>.</>}
          </p>
        </div>
      )}

      {/* Current selection */}
      <div className="panel p-4 flex items-center gap-3 mb-5">
        <MapPin size={18} className="text-sky-400 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Currently selected</div>
          <div className="text-base font-bold" style={{ color: 'var(--text-main)' }}>{city}</div>
        </div>
        <button
          onClick={() => toggle(city)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${saved.includes(city) ? '' : ''}`}
          style={saved.includes(city)
            ? { background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }
            : { background: 'rgba(255,255,255,0.04)', color: 'var(--text-sub)', border: '1px solid var(--panel-border)' }}
          aria-pressed={saved.includes(city)}
        >
          {saved.includes(city) ? <><Star size={13} aria-hidden="true" /> Saved</> : <><Plus size={13} aria-hidden="true" /> Save</>}
        </button>
      </div>

      {/* Saved list */}
      {saved.length > 0 ? (
        <ul className="space-y-2" aria-label="Saved locations">
          <AnimatePresence>
            {saved.map(c => (
              <motion.li
                key={c}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="panel p-3.5 flex items-center gap-3"
              >
                <Star size={15} className="text-amber-400 shrink-0" aria-hidden="true" />
                <span className="flex-1 text-sm font-semibold" style={{ color: c === city ? '#22d3ee' : 'var(--text-main)' }}>{c}</span>
                {c === city && <span className="text-[10px] font-mono" style={{ color: 'var(--text-faint)' }}>active</span>}
                <button
                  onClick={() => selectCity(c)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-slate-900 bg-gradient-to-r from-sky-300 to-sky-400"
                  aria-label={`Use ${c}`}
                >
                  <Check size={12} aria-hidden="true" /> Use
                </button>
                <button
                  onClick={() => toggle(c)}
                  className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-rose-400/10 text-slate-500 hover:text-rose-400"
                  aria-label={`Remove ${c}`}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <div className="panel p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          No saved locations yet. Save the city you&rsquo;re currently viewing above, or browse the list below.
        </div>
      )}

      {/* Add more */}
      <div className="mt-8">
        <button
          onClick={() => setPickerOpen(o => !o)}
          aria-expanded={pickerOpen}
          className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
        >
          <Plus size={14} aria-hidden="true" /> {pickerOpen ? 'Hide city list' : 'Add a city'}
        </button>

        <AnimatePresence>
          {pickerOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="panel p-4 mt-3">
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Filter cities…"
                  aria-label="Filter cities"
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none mb-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--panel-border)', color: 'var(--text-main)' }}
                />
                <ChipGroup label="Cities" className="!flex-wrap">
                  {filtered.map(c => (
                    <ToggleChip
                      key={c}
                      active={saved.includes(c)}
                      onClick={() => toggle(c)}
                      accent="sky"
                      size="sm"
                    >
                      {c}
                    </ToggleChip>
                  ))}
                </ChipGroup>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

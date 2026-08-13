import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Thermometer, Droplets, Wind as WindIcon, Umbrella, Activity, Sparkles, ChevronDown, Eye, CalendarDays, Loader2, RefreshCw, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useCurrentConditions, useForecast } from '../../hooks/useCityData';
import { getAQIColor, getAQICategory, formatDate } from '../../utils/aqiUtils';
import { getHealthAdvice } from '../../utils/health';
import WeatherIcon, { weatherInfo } from './WeatherIcon';

const CATEGORY_RANK = { Good: 0, Moderate: 1, 'Unhealthy for Sensitive': 2, Unhealthy: 3, 'Very Unhealthy': 4, Hazardous: 5 };

function categoryRank(cat) { return CATEGORY_RANK[cat] ?? 0; }

function weekday(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' });
}

function dayLabel(dateStr, idx) {
  if (idx === 0) return 'Today';
  if (idx === 1) return 'Tomorrow';
  return weekday(dateStr);
}

function friendlyDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
}

function Sentiment({ today, tomorrow }) {
  const r1 = categoryRank(today);
  const r2 = categoryRank(tomorrow);
  if (r2 < r1) return { text: 'Air quality is expected to improve tomorrow compared with today.', tone: '#16a34a', Icon: TrendingDown };
  if (r2 > r1) return { text: 'Air quality may be somewhat worse tomorrow than today.', tone: '#d97706', Icon: TrendingUp };
  return { text: 'Air quality is expected to stay much the same tomorrow.', tone: '#64748b', Icon: Sparkles };
}

function simpleAdvice(category) {
  switch (category) {
    case 'Good': return 'Great day to be outside.';
    case 'Moderate': return 'Most people should be comfortable outdoors.';
    case 'Unhealthy for Sensitive': return 'Sensitive people may want to reduce long outdoor activities.';
    case 'Unhealthy': return 'Everyone may feel effects — consider limiting time outdoors.';
    case 'Very Unhealthy': return 'Health alert — avoid outdoor activity where possible.';
    case 'Hazardous': return 'Serious conditions — stay indoors with windows closed.';
    default: return null;
  }
}

/**
 * The core forecasting experience: current conditions, tomorrow's outlook,
 * the next 7 days and an honest explanation of the prediction inputs.
 * Used on both the home page and the dedicated Forecast page.
 */
export default function ForecastDashboard({ detailed = false }) {
  const { city, station } = useLocation();
  const { weather, status: wxStatus, error: wxError, reload: reloadWx } = useCurrentConditions(city, station);
  const { forecast, status: fcStatus, error: fcError, reload: reloadFc } = useForecast(city, station);
  const [showWhy, setShowWhy] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const usingLive = wxStatus === 'live' && weather;
  const currentAQI = usingLive ? (weather.aqi ?? weather.aqiFromPm25) : null;
  const currentCat = currentAQI != null ? getAQICategory(currentAQI) : null;
  const currentColor = currentAQI != null ? getAQIColor(currentAQI) : '#64748b';

  const tomorrow = forecast?.[1] ?? null;
  const todayFc = forecast?.[0] ?? null;

  const sentence = useMemo(() => {
    if (!tomorrow) return null;
    const todayCat = todayFc ? getAQICategory(todayFc.aqi) : currentCat;
    if (todayCat) return Sentiment({ today: todayCat, tomorrow: getAQICategory(tomorrow.aqi) });
    return { text: `Air quality is expected to be ${getAQICategory(tomorrow.aqi).toLowerCase()} tomorrow.`, tone: '#64748b', Icon: Sparkles };
  }, [tomorrow, todayFc, currentCat]);

  const advice = currentAQI != null ? getHealthAdvice(currentAQI) : null;
  const tomorrowAdvice = tomorrow ? simpleAdvice(getAQICategory(tomorrow.aqi)) : null;

  const weatherTiles = [
    { icon: Thermometer, label: 'Temperature', value: weather?.temperature != null ? `${Math.round(weather.temperature)}°C` : null },
    { icon: Droplets, label: 'Humidity', value: weather?.humidity != null ? `${Math.round(weather.humidity)}%` : null },
    { icon: WindIcon, label: 'Wind', value: weather?.wind != null ? `${weather.wind} km/h` : null },
    { icon: Umbrella, label: 'Rain', value: todayFc?.precipProb != null ? `${todayFc.precipProb}%` : null },
    { icon: Activity, label: 'Pollutant', value: weather?.dominantPollutant ? weather.dominantPollutant.toUpperCase() : null },
  ].filter(t => t.value != null);

  const todayAQI = currentAQI ?? todayFc?.aqi ?? null;
  const todayCatLabel = currentCat ?? (todayFc ? getAQICategory(todayFc.aqi) : null);

  return (
    <div className="space-y-5">
      {/* ── Status line ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-1.5">
          <MapPin size={13} className="text-sky-500" aria-hidden="true" />
          <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{city}</span>
          {wxStatus === 'loading' ? (
            <span>· Reading the monitoring station…</span>
          ) : usingLive && weather.time ? (
            <span>· Updated {formatDate(weather.time)}</span>
          ) : (
            <span>· Forecast only — the station isn&rsquo;t reporting right now</span>
          )}
        </div>
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          <span
            className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold"
            style={{
              color: usingLive ? '#16a34a' : '#64748b',
              background: usingLive ? 'rgba(22,163,74,0.10)' : 'rgba(100,116,139,0.10)',
            }}
          >
            {usingLive ? 'Current readings' : 'Atmospheric forecast'}
          </span>
          {wxStatus === 'loading' && <Loader2 size={12} className="animate-spin text-sky-500" aria-hidden="true" />}
          {wxStatus === 'error' && (
            <button onClick={reloadWx} aria-label="Retry current conditions" className="p-1 rounded hover:bg-white/5 transition-colors">
              <RefreshCw size={12} className="text-sky-500" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* ── Tomorrow hero + Current conditions ───────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Tomorrow — the hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel relative overflow-hidden p-6 lg:col-span-3 flex flex-col"
        >
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full pointer-events-none" style={{ background: 'rgba(56,152,255,0.10)', filter: 'blur(52px)' }} aria-hidden="true" />
          <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-sky-500" aria-hidden="true" />
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Tomorrow</div>
                  {tomorrow && <div className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{friendlyDate(tomorrow.date)}</div>}
                </div>
              </div>
            </div>

            {fcStatus === 'loading' ? (
              <div className="flex items-center gap-2 py-10 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Loader2 size={14} className="animate-spin text-sky-500" aria-hidden="true" />
                Computing tomorrow&rsquo;s outlook…
              </div>
            ) : tomorrow ? (
              <>
                <div className="mt-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)] mb-2">Weather forecast</div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <WeatherIcon code={tomorrow.weatherCode} precipProb={tomorrow.precipProb} tempMax={tomorrow.tempMax} size={54} />
                    <div>
                      <div className="text-5xl font-black leading-none tracking-tight" style={{ color: 'var(--text-main)' }}>
                        {tomorrow.tempMax != null ? `${tomorrow.tempMax}°` : '—'}
                        {tomorrow.tempMin != null && <span className="text-xl font-semibold align-top" style={{ color: 'var(--text-faint)' }}> / {tomorrow.tempMin}°</span>}
                      </div>
                      <div className="mt-1 text-sm font-medium" style={{ color: 'var(--text-sub)' }}>
                        {getWeatherLabel(tomorrow)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--panel-border)' }}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)] mb-2">Air quality</div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold" style={{ color: 'var(--text-faint)' }}>AQI</span>
                        <span className="text-[10px] rounded-md px-1.5 py-0.5 font-medium" style={{ color: 'var(--text-muted)', background: 'rgba(100,116,139,0.10)' }}>Atmospheric-model forecast</span>
                      </div>
                      <div className="mt-1 flex items-end gap-3 flex-wrap">
                        <div className="text-6xl font-black leading-none" style={{ color: getAQIColor(tomorrow.aqi) }}>{tomorrow.aqi}</div>
                        <div className="pb-1">
                          <div className="text-lg font-bold" style={{ color: getAQIColor(tomorrow.aqi) }}>{getAQICategory(tomorrow.aqi)}</div>
                          {tomorrow.pm25 != null && <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>PM2.5 ≈ {tomorrow.pm25} µg/m³</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                  {tomorrowAdvice && (
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-sub)' }}>{tomorrowAdvice}</p>
                  )}
                </div>

                {sentence && (
                  <div className="mt-3 flex items-start gap-2 text-sm" style={{ color: sentence.tone }}>
                    <sentence.Icon size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <p className="leading-relaxed">{sentence.text}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
                {fcError ? 'Tomorrow&rsquo;s outlook is unavailable right now.' : 'No forecast data for tomorrow yet.'}
              </div>
            )}

            <button
              onClick={() => setShowWhy(s => !s)}
              aria-expanded={showWhy}
              className="mt-4 self-start inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
            >
              Why this forecast?
              <ChevronDown size={14} className={`transition-transform ${showWhy ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            <AnimatePresence>
              {showWhy && <WhyPrediction city={city} wx={weather} usingLive={usingLive} detailed={detailed} showDetails={showDetails} setShowDetails={setShowDetails} />}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Today / current conditions — compact */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="panel relative overflow-hidden p-6 lg:col-span-2 flex flex-col"
        >
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full pointer-events-none" style={{ background: `${currentColor}12`, filter: 'blur(44px)' }} aria-hidden="true" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Today</div>
              {todayFc && <div className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{friendlyDate(todayFc.date)}</div>}
            </div>

            <div className="mt-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)] mb-2">Weather</div>
              <div className="flex items-center gap-3">
                {todayFc && <WeatherIcon code={todayFc.weatherCode} precipProb={todayFc.precipProb} tempMax={todayFc.tempMax} size={34} />}
                <div>
                  <div className="text-3xl font-black leading-none" style={{ color: 'var(--text-main)' }}>
                    {todayFc?.tempMax != null ? `${todayFc.tempMax}°` : weather?.temperature != null ? `${Math.round(weather.temperature)}°` : '—'}
                  </div>
                  {todayFc?.weatherCode != null && (
                    <div className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-sub)' }}>
                      {getWeatherLabel(todayFc)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--panel-border)' }}>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)] mb-1.5">Air quality</div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold" style={{ color: 'var(--text-faint)' }}>AQI</div>
                  {todayAQI != null ? (
                    <div className="mt-1 text-4xl font-black leading-none" style={{ color: getAQIColor(todayAQI) }}>{todayAQI}</div>
                  ) : (
                    <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {wxStatus === 'loading' ? 'Reading…' : 'Unavailable'}
                    </div>
                  )}
                </div>
                {todayCatLabel && todayAQI != null && (
                  <div className="text-right pb-0.5">
                    <div className="text-sm font-bold" style={{ color: getAQIColor(todayAQI) }}>{todayCatLabel}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                      {usingLive ? 'Current station AQI' : todayFc ? 'Forecast AQI' : '—'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {weatherTiles.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {weatherTiles.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid var(--panel-border)' }}>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
                      <Icon size={11} className="text-sky-500" aria-hidden="true" />
                      {label}
                    </div>
                    <div className="mt-1 text-base font-bold" style={{ color: 'var(--text-main)' }}>{value}</div>
                  </div>
                ))}
              </div>
            )}

            {!usingLive && currentAQI == null && (
              <div className="mt-3 rounded-xl p-3 text-xs leading-relaxed" style={{ background: 'rgba(100,116,139,0.08)', color: 'var(--text-muted)' }}>
                The monitoring station for this city isn&rsquo;t reporting right now. Today&rsquo;s outlook below is computed from an atmospheric model.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Coming days ─────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Coming days</div>
            <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Weather + atmospheric-model AQI forecast</div>
          </div>
          {fcStatus === 'loading'
            ? <Loader2 size={14} className="animate-spin text-sky-500" aria-hidden="true" />
            : fcError && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Forecast temporarily unavailable</span>}
        </div>
        {forecast && forecast.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {forecast.map((d, i) => {
              const color = getAQIColor(d.aqi);
              return (
                <div key={d.date} className="rounded-2xl p-3 text-center transition-all hover:-translate-y-0.5"
                  style={{ background: `${color}0a`, border: `1px solid ${color}1c` }}>
                  <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>{dayLabel(d.date, i)}</div>
                  <div className="mt-2 flex justify-center"><WeatherIcon code={d.weatherCode} precipProb={d.precipProb} tempMax={d.tempMax} size={26} /></div>
                  <div className="mt-1.5 text-lg font-bold leading-none" style={{ color: 'var(--text-main)' }}>
                    {d.tempMax != null ? `${d.tempMax}°` : '—'}
                  </div>
                  <div className="mt-2 text-xl font-black leading-none" style={{ color }}>{d.aqi}</div>
                  <div className="text-[10px] mt-0.5 font-semibold" style={{ color }}>{getAQICategory(d.aqi).split(' ')[0]}</div>
                  {d.precipProb != null && d.precipProb > 0 && (
                    <div className="flex items-center justify-center gap-1 text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}>
                      <Umbrella size={10} aria-hidden="true" /> {d.precipProb}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : !fcError && (
          <div className="rounded-xl border border-dashed px-4 py-6 text-center text-xs" style={{ borderColor: 'var(--panel-border)', color: 'var(--text-muted)' }}>
            {fcStatus === 'loading' ? 'Loading the 7-day outlook…' : 'No forecast data available.'}
          </div>
        )}
      </motion.div>

      {/* ── Explore the past (home compact) ─────────────────────────── */}
      {!detailed && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Info size={15} className="text-emerald-500" aria-hidden="true" />
              <span className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Explore the past</span>
            </div>
            <p className="text-xs leading-relaxed max-w-md" style={{ color: 'var(--text-muted)' }}>
              See how air quality in {city} has changed over the years — annual trends, best and worst periods, and year-on-year comparisons. Historical records are modeled estimates.
            </p>
          </div>
          <Link to="/history" className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 transition-all shadow-md">
            Explore past years
          </Link>
        </motion.div>
      )}

      {/* ── Health guidance (detailed view) ─────────────────────────── */}
      {detailed && todayAQI != null && advice && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="panel p-5"
          style={{ borderColor: `${advice.color}24` }}>
          <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>Health guidance</div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{advice.advice}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {advice.actions.map(a => (
              <span key={a} className="rounded-md px-2 py-1 text-[10px] font-medium" style={{ background: `${advice.color}0d`, border: `1px solid ${advice.color}22`, color: advice.color }}>
                {a}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function getWeatherLabel(day) {
  const { label } = weatherInfo(day?.weatherCode, { precipProb: day?.precipProb, tempMax: day?.tempMax });
  return label || 'Forecast';
}

function WhyPrediction({ city, wx, usingLive, detailed, showDetails, setShowDetails }) {
  const inputs = [
    { label: 'Recent conditions', desc: usingLive ? 'Latest monitoring reading for this city.' : 'Typical readings for this city (reference).', present: true },
    { label: 'Weather outlook', desc: 'Temperature, rain and wind for the coming days from an atmospheric model.', present: true },
    { label: 'Seasonal pattern', desc: 'Typical air quality for this time of year from historical records (modeled estimates).', present: true },
    { label: 'Historical trends', desc: 'How air quality has shifted across recent years in this region (modeled estimates).', present: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-4 rounded-2xl p-4" style={{ background: 'rgba(14,127,214,0.05)', border: '1px solid rgba(14,127,214,0.18)' }}>
        <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-sub)' }}>This forecast is built from these inputs</div>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {inputs.map(({ label, desc, present }) => (
            <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--panel-border)' }}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>{label}</span>
                {present && <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ color: '#16a34a', background: 'rgba(22,163,74,0.10)' }}>included</span>}
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowDetails(s => !s)}
          aria-expanded={showDetails}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
        >
          <Eye size={13} aria-hidden="true" />
          What&rsquo;s behind this forecast?
          <ChevronDown size={13} className={`transition-transform ${showDetails ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 rounded-xl p-3 text-[11px] leading-relaxed space-y-1.5"
              style={{ background: 'rgba(255,255,255,0.45)', border: '1px solid var(--panel-border)', color: 'var(--text-muted)' }}
            >
              <p>AQI24 combines recent conditions with an atmospheric model that forecasts fine particle (PM2.5) concentrations for the coming days. Those values are converted to the standard AQI scale and interpreted using historical seasonal patterns for this region.</p>
              <p>Forecast values come from the Open-Meteo CAMS global air quality model — an atmospheric forecast, not an AQI24 AI prediction. Historical context is derived from reference records and clearly labelled as such. Nothing here is randomly generated.</p>
              <p>Two AQI figures may appear side by side: a <strong>forecast AQI</strong> (from the atmospheric model) and a <strong>current station AQI</strong> (from a nearby monitoring station). They use the same colour categories but can differ because one is a model outlook and the other is a ground reading.</p>
              <div className="flex flex-wrap gap-2 pt-1.5">
                <Link to="/research/methodology" className="text-sky-600 hover:text-sky-700 underline underline-offset-2">Read the methodology</Link>
                {detailed && <Link to="/research/models" className="text-sky-600 hover:text-sky-700 underline underline-offset-2">See model details</Link>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

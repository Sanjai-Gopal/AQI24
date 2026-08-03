// ─── API Service Layer ─────────────────────────────────────────────────────────
// Priority: Real WAQI API → Open-Meteo fallback → graceful error state
// Never falls back to mock/fabricated data for live mode.

import { pm25ToAQI } from './aqiUtils';

// Env vars injected at build time via Vite — never hardcoded
const WAQI_TOKEN = import.meta.env.VITE_WAQI_API_TOKEN || '';
const NASA_FIRMS_KEY = import.meta.env.VITE_NASA_FIRMS_MAP_KEY || '';

// ─── In-memory cache with TTL ──────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > entry.ttl) { cache.delete(key); return null; }
  return entry.data;
}

function setCache(key, data, ttl = CACHE_TTL) {
  cache.set(key, { data, ts: Date.now(), ttl });
}

// ─── Fetch with retry + exponential backoff ────────────────────────────────
async function fetchWithRetry(url, options = {}, retries = 3, baseDelay = 500) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.timeout || 8000);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)));
    }
  }
}

// ─── WAQI: fetch live AQI for a single station by geo ─────────────────────
export async function fetchLiveAQIForCity(cityName, lat, lng) {
  if (!WAQI_TOKEN) return { error: 'VITE_WAQI_API_TOKEN not configured' };
  const key = `waqi_${lat}_${lng}`;
  const cached = getCached(key);
  if (cached) return cached;

  try {
    const json = await fetchWithRetry(
      `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${WAQI_TOKEN}`,
      { timeout: 6000 }
    );
    if (json.status !== 'ok' || !json.data?.aqi) {
      return { error: json.data || 'No data from WAQI' };
    }
    const d = json.data;
    const pm25raw = d.iaqi?.pm25?.v ?? null;
    const result = {
      aqi: d.aqi,
      // Use EPA-correct conversion if raw PM2.5 is available
      aqiFromPm25: pm25raw != null ? pm25ToAQI(pm25raw) : null,
      pm25: pm25raw,
      pm10: d.iaqi?.pm10?.v ?? null,
      no2: d.iaqi?.no2?.v ?? null,
      o3: d.iaqi?.o3?.v ?? null,
      co: d.iaqi?.co?.v ?? null,
      so2: d.iaqi?.so2?.v ?? null,
      humidity: d.iaqi?.h?.v ?? null,
      temperature: d.iaqi?.t?.v ?? null,
      wind: d.iaqi?.w?.v ?? null,
      stationName: d.city?.name ?? cityName,
      dominantPollutant: d.dominentpol ?? null,
      time: d.time?.iso ?? null,
      isLive: true,
    };
    setCache(key, result);
    return result;
  } catch (err) {
    return { error: err.message };
  }
}

// ─── WAQI: fetch multiple cities in parallel ───────────────────────────────
export async function fetchAQIStations(stations) {
  if (!WAQI_TOKEN) {
    return {
      error: 'VITE_WAQI_API_TOKEN is not set. Add it to your .env file.',
      stations: [],
    };
  }
  const key = 'stations_live';
  const cached = getCached(key);
  if (cached) return cached;

  const results = await Promise.allSettled(
    stations.map(async (station) => {
      const live = await fetchLiveAQIForCity(station.city, station.lat, station.lng);
      if (live.error || !live.aqi) return { ...station, isLive: false, liveError: live.error };
      return {
        ...station,
        aqi: live.aqi,
        pm25: live.pm25 ?? station.pm25,
        pm10: live.pm10 ?? station.pm10,
        no2: live.no2 ?? station.no2,
        o3: live.o3 ?? station.o3,
        co: live.co ?? station.co,
        so2: live.so2 ?? station.so2,
        humidity: live.humidity,
        temperature: live.temperature,
        wind: live.wind,
        dominantPollutant: live.dominantPollutant,
        time: live.time,
        isLive: true,
      };
    })
  );

  const enriched = results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : { ...stations[i], isLive: false }
  );
  setCache(key, { stations: enriched }, CACHE_TTL);
  return { stations: enriched };
}

// ─── NASA FIRMS: active fire data ─────────────────────────────────────────
// Fetches 1-day MODIS/VIIRS active fire data for India bounding box
// Bbox: India approx [68, 8, 97, 36]
export async function fetchNASAFIRMS({ source = 'MODIS_NRT', days = 1 } = {}) {
  if (!NASA_FIRMS_KEY) {
    return { error: 'VITE_NASA_FIRMS_MAP_KEY not configured', fires: [] };
  }
  const key = `firms_${source}_${days}`;
  const cached = getCached(key);
  if (cached) return cached;

  // FIRMS Area API: returns CSV
  const bbox = '68.0,8.0,97.0,36.5'; // India bounding box
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${NASA_FIRMS_KEY}/${source}/${bbox}/${days}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`FIRMS HTTP ${res.status}`);
    const text = await res.text();

    // Parse CSV
    const lines = text.trim().split('\n');
    if (lines.length < 2) return { fires: [], source };

    const headers = lines[0].split(',').map(h => h.trim());
    const fires = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols.length < headers.length) continue;
      const row = {};
      headers.forEach((h, j) => { row[h] = cols[j]?.trim(); });

      const lat = parseFloat(row.latitude);
      const lng = parseFloat(row.longitude);
      if (isNaN(lat) || isNaN(lng)) continue;

      fires.push({
        id: `${source}_${i}`,
        lat,
        lng,
        frp: parseFloat(row.frp) || 0,
        brightness: parseFloat(row.brightness || row.bright_ti4) || null,
        confidence: row.confidence || null,
        date: row.acq_date || null,
        time: row.acq_time || null,
        source: row.satellite || source,
        type: classifyFireType(lat, lng),
        state: getIndianState(lat, lng),
        isLive: true,
      });
    }

    const result = { fires, source, count: fires.length };
    setCache(key, result, 30 * 60 * 1000); // 30 min cache for fire data
    return result;
  } catch (err) {
    return { error: err.message, fires: [] };
  }
}

// Heuristic fire type classification by region
function classifyFireType(lat, lng) {
  // Punjab/Haryana crop residue corridor
  if (lat >= 29 && lat <= 32 && lng >= 74 && lng <= 77) return 'Crop Residue';
  // UP crop belt
  if (lat >= 24 && lat <= 29 && lng >= 78 && lng <= 85) return 'Crop Residue';
  // Northeast/Odisha forest
  if (lat >= 20 && lat <= 28 && lng >= 85 && lng <= 96) return 'Forest Fire';
  // MP/Chhattisgarh forests
  if (lat >= 19 && lat <= 24 && lng >= 77 && lng <= 84) return 'Forest Fire';
  return 'Agricultural';
}

// Approximate state from coordinates
function getIndianState(lat, lng) {
  if (lat >= 30 && lng >= 73 && lng <= 77) return 'Punjab/Haryana';
  if (lat >= 26 && lat <= 30 && lng >= 77 && lng <= 84) return 'Uttar Pradesh';
  if (lat >= 19 && lat <= 25 && lng >= 72 && lng <= 80) return 'Madhya Pradesh';
  if (lat >= 19 && lat <= 23 && lng >= 83 && lng <= 87) return 'Odisha';
  if (lat >= 24 && lng >= 87 && lng <= 92) return 'Assam/NE India';
  if (lat >= 22 && lat <= 27 && lng >= 85 && lng <= 88) return 'West Bengal';
  if (lat <= 15 && lng >= 76) return 'South India';
  return 'India';
}

// ─── Open-Meteo: 7-day AQI forecast (free, no key) ────────────────────────
export async function fetchForecast(lat, lng, cityName = '') {
  const key = `forecast_${lat}_${lng}`;
  const cached = getCached(key);
  if (cached) return cached;

  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&hourly=pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide&forecast_days=7&timezone=Asia%2FKolkata`;
    const json = await fetchWithRetry(url, { timeout: 8000 });

    if (!json.hourly?.pm2_5) throw new Error('No forecast data');

    const hours = json.hourly.time;
    const daily = [];
    for (let d = 0; d < 7; d++) {
      const slice = json.hourly.pm2_5.slice(d * 24, (d + 1) * 24).filter(v => v != null);
      if (!slice.length) continue;
      const avgPm25 = slice.reduce((a, v) => a + v, 0) / slice.length;
      const aqi = pm25ToAQI(avgPm25) ?? Math.round(avgPm25 * 4.2);
      daily.push({
        date: hours[d * 24].split('T')[0],
        aqi,
        pm25: Math.round(avgPm25 * 10) / 10,
        pm10: (() => {
          const s = json.hourly.pm10.slice(d*24,(d+1)*24).filter(v=>v!=null);
          return s.length ? Math.round(s.reduce((a,v)=>a+v,0)/s.length*10)/10 : null;
        })(),
        no2: (() => {
          const s = json.hourly.nitrogen_dioxide.slice(d*24,(d+1)*24).filter(v=>v!=null);
          return s.length ? Math.round(s.reduce((a,v)=>a+v,0)/s.length*10)/10 : null;
        })(),
        source: 'Open-Meteo',
        city: cityName,
      });
    }

    setCache(key, daily, 60 * 60 * 1000); // 1hr cache
    return daily;
  } catch (err) {
    return { error: err.message, forecast: [] };
  }
}

// ─── WAQI Map feed: fetch all stations in India bounds ────────────────────
export async function fetchWAQIMapFeed() {
  if (!WAQI_TOKEN) return { error: 'VITE_WAQI_API_TOKEN not set', stations: [] };
  const key = 'waqi_map_india';
  const cached = getCached(key);
  if (cached) return cached;

  try {
    // WAQI map bounds API for India
    const json = await fetchWithRetry(
      `https://api.waqi.info/map/bounds/?latlng=6.4,68.1,35.7,97.4&token=${WAQI_TOKEN}`,
      { timeout: 10000 }
    );
    if (json.status !== 'ok') throw new Error(json.data || 'WAQI map feed error');

    const stations = (json.data || []).map((s, i) => ({
      id: s.uid || i,
      city: s.station?.name || `Station ${i}`,
      lat: s.lat,
      lng: s.lon,
      aqi: typeof s.aqi === 'number' ? s.aqi : parseInt(s.aqi) || 0,
      isLive: true,
      time: s.station?.time || null,
    })).filter(s => s.aqi > 0);

    const result = { stations };
    setCache(key, result, CACHE_TTL);
    return result;
  } catch (err) {
    return { error: err.message, stations: [] };
  }
}

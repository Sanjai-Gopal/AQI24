// ─── Timeline Utilities ─────────────────────────────────────────────────────
// Historical scaling based on CPCB annual report baselines.
// Values labeled as "modeled" — not raw measurements.

import { aqiStations, hchoHotspots, fireEvents, kpiData, trendData } from '../data/mockData';

export function getYearMultiplier(year) {
  if (year === 'Live') return 1.0;
  const yr = parseInt(year, 10);
  if (isNaN(yr)) return 1.0;
  if (yr <= 1990) return 0.35;
  if (yr <= 1995) return 0.42;
  if (yr <= 2000) return 0.55;
  if (yr <= 2005) return 0.68;
  if (yr <= 2010) return 0.80;
  if (yr <= 2015) return 0.92;
  if (yr <= 2018) return 0.98;
  if (yr === 2020) return 0.65;
  if (yr === 2021) return 0.88;
  if (yr === 2022) return 0.93;
  if (yr === 2023) return 0.96;
  if (yr === 2024) return 0.98;
  return 1.0;
}

function getCategoryForAQI(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export function getStationsForYear(year) {
  if (!Array.isArray(aqiStations)) return [];
  const mult = getYearMultiplier(year);
  const yr = year === 'Live' ? 2026 : parseInt(year, 10);
  return aqiStations.map(station => {
    const rawAQI = Math.max(15, Math.round(station.aqi * mult));
    const offset = Math.round(5 * Math.sin(station.lat + yr));
    const aqi = Math.max(10, rawAQI + offset);
    const pm25 = Math.max(5, Math.round((station.pm25 ?? 60) * mult + offset * 0.4));
    const pm10 = Math.max(10, Math.round((station.pm10 ?? 90) * mult + offset * 0.8));
    const no2 = Math.max(2, Math.round((station.no2 ?? 40) * (mult * 0.9) + offset * 0.2));
    const o3 = Math.max(5, Math.round((station.o3 ?? 50) * (2 - mult) * 0.8));
    const co = Math.max(0.1, parseFloat(((station.co ?? 1) * mult).toFixed(1)));
    const so2 = Math.max(1, Math.round((station.so2 ?? 20) * mult));
    return { ...station, aqi, pm25, pm10, no2, o3, co, so2, category: getCategoryForAQI(aqi), isModeled: year !== 'Live' };
  });
}

export function getKPIDataForYear(year) {
  const mult = getYearMultiplier(year);
  const yr = year === 'Live' ? 2026 : parseInt(year, 10);
  const stations = getStationsForYear(year);
  const avgAQI = stations.length
    ? Math.round(stations.reduce((s, st) => s + st.aqi, 0) / stations.length)
    : 0;
  const stationsMonitored = yr < 1995 ? 45 : yr < 2005 ? 180 : yr < 2015 ? 420 : 847;
  return {
    nationalAvgAQI: avgAQI,
    aqiChange: year === 'Live' ? (kpiData?.aqiChange ?? null) : null,
    activeFires: Math.round((kpiData?.activeFires ?? 847) * mult),
    fireChange: year === 'Live' ? (kpiData?.fireChange ?? null) : null,
    hchoMax: (kpiData?.hchoMax ?? 4.2e15) * mult,
    hchoChange: null,
    pm25National: Math.round((kpiData?.pm25National ?? 94) * mult),
    pm25Change: year === 'Live' ? (kpiData?.pm25Change ?? null) : null,
    stationsMonitored,
    satellitePasses: kpiData?.satellitePasses ?? 12,
    lastUpdated: year === 'Live' ? new Date().toISOString() : `${year}-12-31T00:00:00Z`,
    isModeled: year !== 'Live',
  };
}

export function getTrendDataForYear(year) {
  const mult = getYearMultiplier(year);

  const monthly = Array.isArray(trendData?.monthly)
    ? trendData.monthly.map(m => ({
        ...m,
        delhi: Math.round((m.delhi ?? 0) * mult),
        mumbai: Math.round((m.mumbai ?? 0) * mult),
        kolkata: Math.round((m.kolkata ?? 0) * mult),
        national: Math.round((m.national ?? 0) * mult),
      }))
    : [];

  const hourly = Array.isArray(trendData?.hourly)
    ? trendData.hourly.map(h => ({
        ...h,
        aqi: Math.max(10, Math.round((h.aqi ?? 0) * mult)),
        pm25: Math.max(2, Math.round((h.pm25 ?? 0) * mult)),
      }))
    : [];

  const hchoTrend = Array.isArray(trendData?.hchoTrend)
    ? trendData.hchoTrend.map(m => ({
        ...m,
        hcho: parseFloat(((m.hcho ?? 0) * mult).toFixed(2)),
        fires: Math.round((m.fires ?? 0) * mult),
      }))
    : [];

  const pollutantBreakdown = Array.isArray(trendData?.pollutantBreakdown)
    ? trendData.pollutantBreakdown.map(p => ({
        ...p,
        value: Math.max(1, Math.round((p.value ?? 0) * mult)),
      }))
    : [];

  const stateAQI = Array.isArray(trendData?.stateAQI)
    ? trendData.stateAQI.map(s => ({
        ...s,
        aqi: Math.max(10, Math.round((s.aqi ?? 0) * mult)),
        category: getCategoryForAQI(Math.max(10, Math.round((s.aqi ?? 0) * mult))),
      }))
    : [];

  return { monthly, hourly, hchoTrend, pollutantBreakdown, stateAQI };
}

export function getHCHOHotspotsForYear(year) {
  if (!Array.isArray(hchoHotspots)) return [];
  const mult = getYearMultiplier(year);
  return hchoHotspots.map(h => ({
    ...h,
    intensity: Math.max(0.05, (h.intensity ?? 0.5) * mult),
    value: (h.value ?? 1e15) * mult,
    isModeled: year !== 'Live',
  }));
}

export function getFireEventsForYear(year) {
  if (!Array.isArray(fireEvents)) return [];
  const mult = getYearMultiplier(year);
  const yr = year === 'Live' ? 2026 : parseInt(year, 10);
  if (yr < 2000) {
    return fireEvents
      .filter((_, idx) => idx % 3 === 0)
      .map(f => ({ ...f, frp: Math.round((f.frp ?? 0) * mult), isModeled: true }));
  }
  return fireEvents.map(f => ({
    ...f,
    frp: Math.round((f.frp ?? 0) * mult),
    isModeled: year !== 'Live',
  }));
}

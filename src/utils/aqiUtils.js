// ─── AQI Utility Functions ────────────────────────────────────────────────────

export const getAQIColor = (aqi) => {
  if (aqi <= 50) return '#34d399';
  if (aqi <= 100) return '#fbbf24';
  if (aqi <= 150) return '#fb923c';
  if (aqi <= 200) return '#f87171';
  if (aqi <= 300) return '#c084fc';
  return '#f43f5e';
};

export const getAQICategory = (aqi) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

export const getAQIBg = (aqi) => {
  if (aqi <= 50) return 'rgba(52,211,153,0.15)';
  if (aqi <= 100) return 'rgba(251,191,36,0.15)';
  if (aqi <= 150) return 'rgba(251,146,60,0.15)';
  if (aqi <= 200) return 'rgba(248,113,113,0.15)';
  if (aqi <= 300) return 'rgba(192,132,252,0.15)';
  return 'rgba(244,63,94,0.15)';
};

export const getHCHOColor = (intensity) => {
  if (intensity < 0.3) return '#22d3ee';
  if (intensity < 0.5) return '#fbbf24';
  if (intensity < 0.7) return '#fb923c';
  if (intensity < 0.85) return '#f87171';
  return '#f43f5e';
};

export const formatHCHO = (val) => `${(val / 1e15).toFixed(1)}×10¹⁵`;

export const getFireColor = (frp) => {
  if (frp < 50) return '#fbbf24';
  if (frp < 100) return '#fb923c';
  if (frp < 200) return '#f87171';
  return '#f43f5e';
};

export const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
  }) + ' IST';

/**
 * Standard US EPA linear interpolation PM2.5 → AQI conversion.
 * Breakpoints from EPA AQI Technical Assistance Document (August 2016).
 */
export function pm25ToAQI(pm25) {
  if (pm25 == null || isNaN(pm25)) return null;
  const c = Math.round(pm25 * 10) / 10; // truncate to 1 decimal per EPA
  const bp = [
    { lo: 0,    hi: 12.0,  aqiLo: 0,   aqiHi: 50  },
    { lo: 12.1, hi: 35.4,  aqiLo: 51,  aqiHi: 100 },
    { lo: 35.5, hi: 55.4,  aqiLo: 101, aqiHi: 150 },
    { lo: 55.5, hi: 150.4, aqiLo: 151, aqiHi: 200 },
    { lo: 150.5,hi: 250.4, aqiLo: 201, aqiHi: 300 },
    { lo: 250.5,hi: 350.4, aqiLo: 301, aqiHi: 400 },
    { lo: 350.5,hi: 500.4, aqiLo: 401, aqiHi: 500 },
  ];
  const range = bp.find(b => c >= b.lo && c <= b.hi);
  if (!range) return c > 500 ? 500 : 0;
  return Math.round(
    ((range.aqiHi - range.aqiLo) / (range.hi - range.lo)) * (c - range.lo) + range.aqiLo
  );
}

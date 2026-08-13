import { Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudRainWind, CloudSnow, CloudLightning } from 'lucide-react';

/**
 * Maps WMO weather condition codes (as returned by Open-Meteo) to friendly
 * labels and lucide icons. Derived from real model output — never invented.
 *
 * Codes per https://open-meteo.com/en/docs (WMO weather interpretation codes)
 */
const WEATHER_MAP = [
  { codes: [0, 1],            label: 'Clear',           Icon: Sun,          accent: '#f59e0b' },
  { codes: [2],               label: 'Partly cloudy',   Icon: CloudSun,     accent: '#0ea5e9' },
  { codes: [3],               label: 'Overcast',        Icon: Cloud,        accent: '#64748b' },
  { codes: [45, 48],          label: 'Foggy',           Icon: CloudFog,     accent: '#94a3b8' },
  { codes: [51, 53, 55, 56, 57], label: 'Drizzle',      Icon: CloudDrizzle, accent: '#38bdf8' },
  { codes: [61, 63, 65, 66, 67], label: 'Rain',         Icon: CloudRain,    accent: '#3b82f6' },
  { codes: [71, 73, 75, 77],   label: 'Snow',           Icon: CloudSnow,    accent: '#93c5fd' },
  { codes: [80, 81, 82],       label: 'Rain showers',   Icon: CloudRainWind, accent: '#2563eb' },
  { codes: [85, 86],           label: 'Snow showers',   Icon: CloudSnow,    accent: '#93c5fd' },
  { codes: [95, 96, 99],       label: 'Thunderstorm',   Icon: CloudLightning, accent: '#7c3aed' },
];

function baseMatch(code) {
  if (code == null) return null;
  return WEATHER_MAP.find(w => w.codes.includes(code)) || null;
}

/**
 * Choose the most appropriate icon/label given the raw WMO code and the day's
 * context. Open-Meteo's `weather_code` can report a thunderstorm even when the
 * daily precipitation probability is very low and temperatures are high; in
 * that case a clear/partly-cloudy icon is less misleading.
 */
export function weatherInfo(code, { precipProb, tempMax } = {}) {
  const match = baseMatch(code);
  const isStormy = match && [95, 96, 99].some(c => match.codes.includes(c));
  const isRainy = match && [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].some(c => match.codes.includes(c));
  const isOvercast = match && match.codes.includes(3);
  const isFoggy = match && [45, 48].some(c => match.codes.includes(c));

  // Hot, dry day → prefer clear/sunny presentation.
  const warm = tempMax != null && tempMax >= 28;
  const hot = tempMax != null && tempMax >= 30;
  const noRain = precipProb == null || precipProb < 25;
  const lightRain = precipProb != null && precipProb < 60;

  // Open-Meteo sometimes reports a thunderstorm/overcast code on warm days
  // with only a modest rain chance. Prefer a sunnier icon when the temperature
  // is high and significant rain is unlikely.
  if (isStormy && warm) {
    if (hot && noRain) return { label: 'Clear', Icon: Sun, accent: '#f59e0b' };
    if (lightRain) return { label: 'Partly cloudy', Icon: CloudSun, accent: '#0ea5e9' };
  }
  if ((isRainy || isOvercast || isFoggy) && hot && noRain) {
    return { label: 'Partly cloudy', Icon: CloudSun, accent: '#0ea5e9' };
  }
  if (match) return match;
  return { label: null, Icon: Cloud, accent: '#94a3b8' };
}

export function WeatherIcon({ code, precipProb, tempMax, size = 44, className = '', strokeWidth = 1.8 }) {
  const { Icon, accent } = weatherInfo(code, { precipProb, tempMax });
  return <Icon size={size} strokeWidth={strokeWidth} className={className} style={{ color: accent }} aria-hidden="true" />;
}

export default WeatherIcon;

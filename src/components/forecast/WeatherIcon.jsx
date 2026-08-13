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

export function weatherInfo(code) {
  if (code == null) return { label: null, Icon: Cloud, accent: '#94a3b8' };
  const match = WEATHER_MAP.find(w => w.codes.includes(code));
  if (match) return match;
  return { label: null, Icon: Cloud, accent: '#94a3b8' };
}

export function WeatherIcon({ code, size = 44, className = '', strokeWidth = 1.8 }) {
  const { Icon, accent } = weatherInfo(code);
  return <Icon size={size} strokeWidth={strokeWidth} className={className} style={{ color: accent }} aria-hidden="true" />;
}

export default WeatherIcon;

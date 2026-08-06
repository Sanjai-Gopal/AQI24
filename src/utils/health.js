// ─── Health Guidance (EPA-aligned recommendations) ────────────────────────
// Advice strings are derived deterministically from the current AQI category,
// following the US EPA AQI health guidance structure.

const LEVELS = [
  {
    max: 50,
    category: 'Good',
    color: '#34d399',
    title: 'Air quality is good',
    advice: 'Air quality is considered satisfactory and poses little or no risk. Enjoy normal outdoor activities and ventilation.',
    actions: ['No precautions needed', 'Ideal for outdoor exercise'],
  },
  {
    max: 100,
    category: 'Moderate',
    color: '#fbbf24',
    title: 'Air quality is acceptable',
    advice: 'Air quality is acceptable for most people, but a small number of unusually sensitive individuals may experience minor effects.',
    actions: ['Unusually sensitive groups: reduce prolonged outdoor exertion'],
  },
  {
    max: 150,
    category: 'Unhealthy for Sensitive Groups',
    color: '#fb923c',
    title: 'Sensitive groups at risk',
    advice: 'Children, older adults and people with respiratory conditions may experience health effects. The general public is less likely to be affected.',
    actions: ['Wear an N95 mask outdoors', 'Reduce prolonged outdoor exertion', 'Keep medication on hand'],
  },
  {
    max: 200,
    category: 'Unhealthy',
    color: '#f87171',
    title: 'Everyone may feel effects',
    advice: 'Everyone may begin to experience health effects. Sensitive groups may experience more serious effects. Limit time outdoors.',
    actions: ['Avoid outdoor exertion', 'Keep windows closed', 'Run air purifiers indoors'],
  },
  {
    max: 300,
    category: 'Very Unhealthy',
    color: '#c084fc',
    title: 'Health alert level',
    advice: 'Health warnings of emergency conditions. The entire population is more likely to be affected. Avoid all outdoor activity.',
    actions: ['Avoid all outdoor activity', 'Run HEPA air purifiers', 'Wear an N95 mask', 'Hydrate and rest'],
  },
  {
    max: 500,
    category: 'Hazardous',
    color: '#f43f5e',
    title: 'Emergency conditions',
    advice: 'Health alert: everyone may experience serious health effects. Remain indoors with windows sealed and air purifiers running.',
    actions: ['Stay indoors with windows sealed', 'Run HEPA purifiers continuously', 'Wear an N95 mask', 'Avoid any exertion'],
  },
];

/**
 * Returns EPA-aligned health guidance for a given AQI value.
 * Returns null when the value is not a usable number.
 */
export function getHealthAdvice(aqi) {
  if (aqi == null || isNaN(aqi)) return null;
  return LEVELS.find(l => aqi <= l.max) || LEVELS[LEVELS.length - 1];
}

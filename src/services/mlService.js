/**
 * ML Service — fires AQI24
 * ========================
 * Loads fire radiative power predictions and model metadata from the
 * FastAPI backend. Falls back to the static bundled JSON if the backend
 * is unreachable, so all pages keep working unchanged.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let _cache = null;

async function fetchJSON(url, timeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchMLPredictions() {
  if (_cache) return _cache;
  try {
    _cache = await fetchJSON(`${API_BASE_URL}/api/v1/ml/predictions`);
    return _cache;
  } catch (err) {
    try {
      _cache = await fetchJSON('/ml/predictions.json');
      return _cache;
    } catch (fallbackErr) {
      return { error: fallbackErr.message };
    }
  }
}

export async function fetchModelMeta() {
  try {
    return await fetchJSON(`${API_BASE_URL}/api/v1/ml/model-meta`);
  } catch (err) {
    try {
      return await fetchJSON('/ml/model_meta.json');
    } catch (fallbackErr) {
      return { error: fallbackErr.message };
    }
  }
}

/**
 * Get regional predictions for a specific season.
 * @param {string} season - 'winter' | 'summer' | 'post_monsoon' | 'monsoon'
 * @param {string} brightnessLevel - 'low' | 'medium' | 'high' | 'extreme'
 */
export async function getRegionalPredictions(season = null, brightnessLevel = 'medium') {
  const data = await fetchMLPredictions();
  if (data.error) return { error: data.error, predictions: [] };

  let predictions = data.regional_predictions || [];
  if (season) predictions = predictions.filter(p => p.season === season);
  predictions = predictions.filter(p => p.brightness_level === brightnessLevel);

  return { predictions, model_info: data.model_info };
}

/**
 * Get severity color for a class (0-3).
 */
export function severityColor(sev) {
  return ['#34d399', '#fbbf24', '#fb923c', '#f43f5e'][sev] ?? '#64748b';
}

/**
 * Get severity background for a class.
 */
export function severityBg(sev) {
  return [
    'rgba(52,211,153,0.1)',
    'rgba(251,191,36,0.1)',
    'rgba(251,146,60,0.1)',
    'rgba(244,63,94,0.1)',
  ][sev] ?? 'rgba(100,116,139,0.1)';
}

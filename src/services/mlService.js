/**
 * ML Service — fires AQI24
 * ========================
 * Loads fire radiative power predictions and model metadata from the
 * FastAPI backend. Falls back to the static bundled JSON if the backend
 * is unreachable, so all pages keep working unchanged.
 *
 * When the backend responds but its model metadata is missing/null, the
 * verified static metadata from public/ml/model_meta.json is used only to
 * fill those missing fields. Metrics are never fabricated.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let _cache = null;
let _staticMeta = null;

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

async function getStaticMeta() {
  if (_staticMeta) return _staticMeta;
  try {
    _staticMeta = await fetchJSON('/ml/model_meta.json');
  } catch (err) {
    _staticMeta = {};
  }
  return _staticMeta;
}

/**
 * Merge missing/null backend model_info fields with verified static metadata.
 * Static values are only used when the backend field is absent — never to
 * overwrite a real backend value.
 */
function normalizeInfo(info, fallback) {
  if (!info || typeof info !== 'object') return fallback || null;
  const fb = fallback || {};
  return {
    ...info,
    total_records_in_dataset:
      info.total_records_in_dataset ??
      info.archive_total ??
      fb.total_records_in_dataset ??
      fb.archive_total ??
      null,
    frp_regressor: { ...(fb.frp_regressor || {}), ...(info.frp_regressor || {}) },
    severity_classifier: { ...(fb.severity_classifier || {}), ...(info.severity_classifier || {}) },
  };
}

export async function fetchMLPredictions() {
  if (_cache) return _cache;
  const fallback = await getStaticMeta();

  try {
    const backend = await fetchJSON(`${API_BASE_URL}/api/v1/ml/predictions`);
    if (backend && Array.isArray(backend.regional_predictions)) {
      _cache = {
        ...backend,
        model_info: normalizeInfo(backend.model_info, fallback),
      };
      return _cache;
    }
  } catch (err) {
    // Backend unreachable — fall through to static bundle below.
  }

  try {
    const staticData = await fetchJSON('/ml/predictions.json');
    _cache = {
      ...staticData,
      model_info: normalizeInfo(staticData.model_info, fallback),
    };
    return _cache;
  } catch (fallbackErr) {
    return { error: fallbackErr.message };
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

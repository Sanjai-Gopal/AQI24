/**
 * Centralized Data Interface Layer
 * =================================
 * All page components import from here, never directly from mockData.js or api.js.
 * When the backend is ready, swap the implementations below without touching any page.
 *
 * Pattern:
 *   - fetchXxx()  → async, returns real API data (or reference data + warning flag)
 *   - getXxx()    → sync accessor for in-memory/derived data
 */

import {
  fetchLiveAQIForCity,
  fetchWAQIMapFeed,
  fetchNASAFIRMS,
  fetchForecast,
} from '../utils/api';

import {
  aqiStations,
  hchoHotspots,
  fireEvents,
  kpiData,
  trendData,
  historicalYearlyData,
  satelliteData,
} from '../data/mockData';

import {
  getStationsForYear,
  getKPIDataForYear,
  getTrendDataForYear,
  getHCHOHotspotsForYear,
  getFireEventsForYear,
} from '../utils/timelineUtils';

// ── Re-exports so pages never import from multiple sources ──────────────
export { historicalYearlyData, satelliteData };

// ── Reference data (labeled as such in UI) ─────────────────────────────
export const getReferenceStations   = () => aqiStations;
export const getReferenceHotspots   = () => hchoHotspots;
export const getReferenceFireEvents = () => fireEvents;
export const getReferenceKPI        = () => kpiData;
export const getReferenceTrend      = () => trendData;

// ── Timeline-scaled data ────────────────────────────────────────────────
export const getStations  = (year) => getStationsForYear(year);
export const getKPI       = (year) => getKPIDataForYear(year);
export const getTrend     = (year) => getTrendDataForYear(year);
export const getHotspots  = (year) => getHCHOHotspotsForYear(year);
export const getFires     = (year) => getFireEventsForYear(year);

// ── Live API calls (ready for backend swap) ────────────────────────────
export const fetchLiveStations = ()       => fetchWAQIMapFeed();
export const fetchCityAQI      = (c,l,g)  => fetchLiveAQIForCity(c,l,g);
export const fetchLiveFires    = (opts)   => fetchNASAFIRMS(opts);
export const fetchAQIForecast  = (l,g,c)  => fetchForecast(l,g,c);

/**
 * TODO: Replace any of the above with real backend calls, e.g.:
 *   export const fetchLiveStations = () =>
 *     fetch(`${import.meta.env.VITE_API_URL}/api/stations`).then(r => r.json());
 */

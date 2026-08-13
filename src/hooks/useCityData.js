import { useState, useEffect, useCallback } from 'react';
import { fetchLiveAQIForCity, fetchForecast } from '../utils/api';

/**
 * Live current conditions (WAQI) for a city. Never falls back to invented
 * numbers — when unavailable the caller shows an honest "data unavailable".
 */
export function useCurrentConditions(city, station) {
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | live | error
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    const res = await fetchLiveAQIForCity(city, station.lat, station.lng);
    if (res.error) {
      setStatus('error');
      setError(res.error);
      setWeather(null);
    } else {
      setWeather(res);
      setStatus('live');
    }
  }, [city, station.lat, station.lng]);

  useEffect(() => { load(); }, [load]);

  return { weather, status, error, reload: load };
}

/**
 * 7-day air quality forecast (Open-Meteo CAMS). Real model output only.
 */
export function useForecast(city, station) {
  const [forecast, setForecast] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | live | error
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    const res = await fetchForecast(station.lat, station.lng, city);
    if (res.error) {
      setStatus('error');
      setError(res.error);
      setForecast(null);
    } else if (Array.isArray(res) && res.length > 0) {
      setForecast(res);
      setStatus('live');
    } else {
      setStatus('error');
      setError('No forecast data returned for this location.');
      setForecast(null);
    }
  }, [city, station.lat, station.lng]);

  useEffect(() => { load(); }, [load]);

  return { forecast, status, error, reload: load };
}

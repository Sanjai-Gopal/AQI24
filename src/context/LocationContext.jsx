import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { aqiStations } from '../data/mockData';
import { geocodeCity } from '../utils/api';

const DEFAULT_CITY = 'Coimbatore';
const STORAGE_KEY = 'aqi24_location';

const LocationContext = createContext(null);

function distanceSq(lat1, lng1, lat2, lng2) {
  return (lat1 - lat2) ** 2 + (lng1 - lng2) ** 2;
}

/**
 * Shared location state for the whole app.
 *
 * Any page can read the selected city and its station metadata, change the
 * city, or ask the browser for the device location. The selection is remembered
 * across visits for known reference stations. Unknown cities are resolved with
 * Open-Meteo geocoding and are not persisted, so the app never shows a stale
 * default for a place it has not seen before.
 */
export function LocationProvider({ children }) {
  const [city, setCity] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved && aqiStations.some(s => s.city === saved) ? saved : DEFAULT_CITY;
    } catch {
      return DEFAULT_CITY;
    }
  });
  const [station, setStation] = useState(() => aqiStations.find(s => s.city === city) || aqiStations[0]);
  const [usingDeviceLocation, setUsingDeviceLocation] = useState(false);
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | loading | ok | error

  useEffect(() => {
    try {
      // Only persist known reference cities; geocoded selections are resolved on demand.
      if (aqiStations.some(s => s.city === city)) {
        localStorage.setItem(STORAGE_KEY, city);
      }
    } catch { /* ignore */ }
  }, [city]);

  const selectCity = useCallback(async (c) => {
    if (!c) return null;
    const known = aqiStations.find(s => s.city === c);
    if (known) {
      setCity(known.city);
      setStation(known);
      setUsingDeviceLocation(false);
      setGeoStatus('ok');
      return known;
    }
    setGeoStatus('loading');
    try {
      const geo = await geocodeCity(c);
      if (geo) {
        const resolved = { city: geo.city, lat: geo.lat, lng: geo.lng, isGeocoded: true };
        setCity(geo.city);
        setStation(resolved);
        setUsingDeviceLocation(false);
        setGeoStatus('ok');
        return resolved;
      }
    } catch { /* fall through */ }
    setGeoStatus('error');
    return null;
  }, []);

  const useDeviceLocation = useCallback(() => {
    if (!navigator.geolocation) { setGeoStatus('error'); return; }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        let nearest = DEFAULT_CITY;
        let best = Infinity;
        aqiStations.forEach(s => {
          const d = distanceSq(s.lat, s.lng, pos.coords.latitude, pos.coords.longitude);
          if (d < best) { best = d; nearest = s.city; }
        });
        setUsingDeviceLocation(true);
        setCity(nearest);
        setStation(aqiStations.find(s => s.city === nearest) || aqiStations[0]);
        setGeoStatus('ok');
      },
      () => setGeoStatus('error'),
      { timeout: 8000, maximumAge: 600000 }
    );
  }, []);

  const value = useMemo(() => ({
    city,
    station,
    usingDeviceLocation,
    geoStatus,
    selectCity,
    useDeviceLocation,
    allCities: aqiStations.map(s => s.city),
    allStations: aqiStations,
  }), [city, station, usingDeviceLocation, geoStatus, selectCity, useDeviceLocation]);

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within a LocationProvider');
  return ctx;
}

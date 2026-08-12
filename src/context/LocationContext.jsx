import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { aqiStations } from '../data/mockData';

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
 * city, or ask the browser for the device location (which snaps to the
 * nearest known city). The selection is remembered across visits.
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
  const [usingDeviceLocation, setUsingDeviceLocation] = useState(false);
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | loading | ok | error

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, city); } catch { /* ignore */ }
  }, [city]);

  const selectCity = useCallback((c) => {
    if (!c || !aqiStations.some(s => s.city === c)) return;
    setCity(c);
    setUsingDeviceLocation(false);
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
        setGeoStatus('ok');
      },
      () => setGeoStatus('error'),
      { timeout: 8000, maximumAge: 600000 }
    );
  }, []);

  const station = aqiStations.find(s => s.city === city) || aqiStations[0];

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

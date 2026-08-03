// ─── AQI Station Data — India ─────────────────────────────────────────────────
export const aqiStations = [
  { id: 1, city: "Delhi", lat: 28.6139, lng: 77.2090, aqi: 312, pm25: 187, pm10: 245, no2: 98, o3: 52, co: 3.4, so2: 28, category: "Hazardous", trend: "up" },
  { id: 2, city: "Mumbai", lat: 19.0760, lng: 72.8777, aqi: 148, pm25: 72, pm10: 118, no2: 61, o3: 44, co: 1.8, so2: 18, category: "Unhealthy", trend: "stable" },
  { id: 3, city: "Kolkata", lat: 22.5726, lng: 88.3639, aqi: 198, pm25: 112, pm10: 165, no2: 74, o3: 38, co: 2.1, so2: 22, category: "Very Unhealthy", trend: "down" },
  { id: 4, city: "Chennai", lat: 13.0827, lng: 80.2707, aqi: 89, pm25: 38, pm10: 67, no2: 42, o3: 55, co: 1.2, so2: 12, category: "Moderate", trend: "stable" },
  { id: 5, city: "Bengaluru", lat: 12.9716, lng: 77.5946, aqi: 112, pm25: 54, pm10: 88, no2: 48, o3: 58, co: 1.4, so2: 14, category: "Unhealthy for Sensitive", trend: "up" },
  { id: 6, city: "Hyderabad", lat: 17.3850, lng: 78.4867, aqi: 134, pm25: 65, pm10: 102, no2: 56, o3: 48, co: 1.6, so2: 16, category: "Unhealthy for Sensitive", trend: "stable" },
  { id: 7, city: "Ahmedabad", lat: 23.0225, lng: 72.5714, aqi: 175, pm25: 94, pm10: 145, no2: 68, o3: 41, co: 2.2, so2: 24, category: "Unhealthy", trend: "up" },
  { id: 8, city: "Pune", lat: 18.5204, lng: 73.8567, aqi: 102, pm25: 48, pm10: 79, no2: 45, o3: 52, co: 1.3, so2: 13, category: "Unhealthy for Sensitive", trend: "down" },
  { id: 9, city: "Jaipur", lat: 26.9124, lng: 75.7873, aqi: 224, pm25: 128, pm10: 198, no2: 82, o3: 36, co: 2.8, so2: 31, category: "Very Unhealthy", trend: "up" },
  { id: 10, city: "Lucknow", lat: 26.8467, lng: 80.9462, aqi: 267, pm25: 158, pm10: 221, no2: 91, o3: 34, co: 3.1, so2: 35, category: "Very Unhealthy", trend: "up" },
  { id: 11, city: "Kanpur", lat: 26.4499, lng: 80.3319, aqi: 289, pm25: 172, pm10: 238, no2: 95, o3: 31, co: 3.3, so2: 38, category: "Hazardous", trend: "up" },
  { id: 12, city: "Nagpur", lat: 21.1458, lng: 79.0882, aqi: 118, pm25: 58, pm10: 94, no2: 51, o3: 49, co: 1.5, so2: 15, category: "Unhealthy for Sensitive", trend: "stable" },
  { id: 13, city: "Patna", lat: 25.5941, lng: 85.1376, aqi: 242, pm25: 141, pm10: 208, no2: 87, o3: 33, co: 2.9, so2: 33, category: "Very Unhealthy", trend: "up" },
  { id: 14, city: "Indore", lat: 22.7196, lng: 75.8577, aqi: 156, pm25: 82, pm10: 126, no2: 64, o3: 43, co: 1.9, so2: 21, category: "Unhealthy", trend: "stable" },
  { id: 15, city: "Bhopal", lat: 23.2599, lng: 77.4126, aqi: 143, pm25: 70, pm10: 112, no2: 59, o3: 46, co: 1.7, so2: 19, category: "Unhealthy for Sensitive", trend: "down" },
  { id: 16, city: "Visakhapatnam", lat: 17.6868, lng: 83.2185, aqi: 94, pm25: 42, pm10: 72, no2: 44, o3: 57, co: 1.2, so2: 11, category: "Moderate", trend: "stable" },
  { id: 17, city: "Surat", lat: 21.1702, lng: 72.8311, aqi: 168, pm25: 88, pm10: 138, no2: 66, o3: 42, co: 2.0, so2: 23, category: "Unhealthy", trend: "up" },
  { id: 18, city: "Vadodara", lat: 22.3072, lng: 73.1812, aqi: 152, pm25: 78, pm10: 122, no2: 62, o3: 44, co: 1.8, so2: 20, category: "Unhealthy", trend: "stable" },
  { id: 19, city: "Coimbatore", lat: 11.0168, lng: 76.9558, aqi: 76, pm25: 32, pm10: 58, no2: 38, o3: 61, co: 1.0, so2: 9, category: "Moderate", trend: "down" },
  { id: 20, city: "Kochi", lat: 9.9312, lng: 76.2673, aqi: 64, pm25: 26, pm10: 48, no2: 34, o3: 64, co: 0.9, so2: 7, category: "Good", trend: "stable" },
  { id: 21, city: "Guwahati", lat: 26.1445, lng: 91.7362, aqi: 128, pm25: 62, pm10: 98, no2: 53, o3: 47, co: 1.6, so2: 17, category: "Unhealthy for Sensitive", trend: "stable" },
  { id: 22, city: "Chandigarh", lat: 30.7333, lng: 76.7794, aqi: 188, pm25: 102, pm10: 158, no2: 72, o3: 39, co: 2.3, so2: 26, category: "Unhealthy", trend: "up" },
  { id: 23, city: "Amritsar", lat: 31.6340, lng: 74.8723, aqi: 234, pm25: 136, pm10: 201, no2: 84, o3: 35, co: 2.8, so2: 32, category: "Very Unhealthy", trend: "up" },
  { id: 24, city: "Varanasi", lat: 25.3176, lng: 82.9739, aqi: 258, pm25: 151, pm10: 215, no2: 89, o3: 32, co: 3.0, so2: 36, category: "Very Unhealthy", trend: "up" },
  { id: 25, city: "Agra", lat: 27.1767, lng: 78.0081, aqi: 248, pm25: 146, pm10: 209, no2: 86, o3: 33, co: 2.95, so2: 34, category: "Very Unhealthy", trend: "up" },
  { id: 26, city: "Meerut", lat: 28.9845, lng: 77.7064, aqi: 278, pm25: 166, pm10: 231, no2: 93, o3: 30, co: 3.2, so2: 37, category: "Very Unhealthy", trend: "up" },
  { id: 27, city: "Faridabad", lat: 28.4089, lng: 77.3178, aqi: 295, pm25: 177, pm10: 240, no2: 96, o3: 29, co: 3.4, so2: 39, category: "Hazardous", trend: "up" },
  { id: 28, city: "Ghaziabad", lat: 28.6692, lng: 77.4538, aqi: 301, pm25: 181, pm10: 248, no2: 97, o3: 28, co: 3.5, so2: 40, category: "Hazardous", trend: "up" },
  { id: 29, city: "Noida", lat: 28.5355, lng: 77.3910, aqi: 287, pm25: 172, pm10: 235, no2: 94, o3: 31, co: 3.3, so2: 37, category: "Hazardous", trend: "up" },
  { id: 30, city: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366, aqi: 55, pm25: 22, pm10: 41, no2: 29, o3: 68, co: 0.7, so2: 5, category: "Moderate", trend: "stable" },
];

export const hchoHotspots = [
  { lat: 30.7333, lng: 76.7794, intensity: 0.92, region: "Punjab", value: 4.8e15, source: "Biomass Burning" },
  { lat: 28.6139, lng: 77.2090, intensity: 0.88, region: "Delhi NCR", value: 4.2e15, source: "Industrial + Traffic" },
  { lat: 26.9124, lng: 75.7873, intensity: 0.74, region: "Rajasthan", value: 3.6e15, source: "Biomass Burning" },
  { lat: 25.3176, lng: 82.9739, intensity: 0.81, region: "UP East", value: 3.9e15, source: "Crop Residue" },
  { lat: 22.5726, lng: 88.3639, intensity: 0.68, region: "West Bengal", value: 3.2e15, source: "Industrial" },
  { lat: 26.4499, lng: 80.3319, intensity: 0.85, region: "UP Central", value: 4.1e15, source: "Crop Residue" },
  { lat: 13.0827, lng: 80.2707, intensity: 0.42, region: "Tamil Nadu", value: 2.1e15, source: "Traffic" },
  { lat: 19.0760, lng: 72.8777, intensity: 0.55, region: "Mumbai", value: 2.8e15, source: "Industrial + Traffic" },
  { lat: 20.2961, lng: 85.8245, intensity: 0.72, region: "Odisha", value: 3.5e15, source: "Forest Fire" },
  { lat: 23.2599, lng: 77.4126, intensity: 0.61, region: "Madhya Pradesh", value: 2.9e15, source: "Biomass Burning" },
  { lat: 21.1458, lng: 79.0882, intensity: 0.58, region: "Vidarbha", value: 2.7e15, source: "Forest Fire" },
  { lat: 31.6340, lng: 74.8723, intensity: 0.89, region: "Amritsar", value: 4.3e15, source: "Crop Residue" },
  { lat: 29.9457, lng: 78.1642, intensity: 0.52, region: "Uttarakhand", value: 2.5e15, source: "Forest Fire" },
  { lat: 24.5854, lng: 73.7125, intensity: 0.64, region: "Rajasthan South", value: 3.0e15, source: "Biomass Burning" },
];

export const fireEvents = [
  { id: 1, lat: 30.5, lng: 76.2, frp: 142, confidence: 95, date: "2026-06-16", source: "MODIS", type: "Crop Residue", state: "Punjab" },
  { id: 2, lat: 30.8, lng: 75.9, frp: 118, confidence: 88, date: "2026-06-16", source: "VIIRS", type: "Crop Residue", state: "Punjab" },
  { id: 3, lat: 29.1, lng: 76.4, frp: 98, confidence: 82, date: "2026-06-16", source: "MODIS", type: "Crop Residue", state: "Haryana" },
  { id: 4, lat: 28.9, lng: 76.8, frp: 87, confidence: 79, date: "2026-06-15", source: "VIIRS", type: "Crop Residue", state: "Haryana" },
  { id: 5, lat: 20.5, lng: 85.2, frp: 234, confidence: 97, date: "2026-06-16", source: "MODIS", type: "Forest Fire", state: "Odisha" },
  { id: 6, lat: 21.3, lng: 84.8, frp: 198, confidence: 94, date: "2026-06-16", source: "VIIRS", type: "Forest Fire", state: "Odisha" },
  { id: 7, lat: 22.1, lng: 79.5, frp: 176, confidence: 91, date: "2026-06-15", source: "MODIS", type: "Forest Fire", state: "MP" },
  { id: 8, lat: 30.1, lng: 78.4, frp: 89, confidence: 76, date: "2026-06-14", source: "VIIRS", type: "Forest Fire", state: "Uttarakhand" },
  { id: 9, lat: 26.8, lng: 94.2, frp: 312, confidence: 98, date: "2026-06-16", source: "MODIS", type: "Forest Fire", state: "Assam" },
  { id: 10, lat: 27.2, lng: 93.8, frp: 287, confidence: 96, date: "2026-06-16", source: "VIIRS", type: "Forest Fire", state: "Assam" },
  { id: 11, lat: 23.5, lng: 87.2, frp: 67, confidence: 72, date: "2026-06-15", source: "MODIS", type: "Industrial", state: "West Bengal" },
  { id: 12, lat: 17.8, lng: 83.4, frp: 54, confidence: 68, date: "2026-06-14", source: "VIIRS", type: "Agricultural", state: "AP" },
  { id: 13, lat: 31.2, lng: 75.4, frp: 156, confidence: 93, date: "2026-06-16", source: "MODIS", type: "Crop Residue", state: "Punjab" },
  { id: 14, lat: 25.1, lng: 83.5, frp: 109, confidence: 84, date: "2026-06-15", source: "VIIRS", type: "Crop Residue", state: "UP" },
  { id: 15, lat: 22.8, lng: 77.1, frp: 132, confidence: 87, date: "2026-06-16", source: "MODIS", type: "Forest Fire", state: "MP" },
];

export const kpiData = {
  nationalAvgAQI: 178,
  aqiChange: +12,
  activeFires: 847,
  fireChange: -34,
  hchoMax: 4.8e15,
  hchoChange: +0.3e15,
  pm25National: 94,
  pm25Change: +8,
  stationsMonitored: 847,
  satellitePasses: 12,
  lastUpdated: new Date().toISOString(),
};

export const trendData = {
  monthly: [
    { month: "Jan", delhi: 289, mumbai: 168, kolkata: 212, national: 198 },
    { month: "Feb", delhi: 264, mumbai: 154, kolkata: 195, national: 182 },
    { month: "Mar", delhi: 231, mumbai: 138, kolkata: 178, national: 164 },
    { month: "Apr", delhi: 198, mumbai: 124, kolkata: 156, national: 148 },
    { month: "May", delhi: 187, mumbai: 132, kolkata: 167, national: 156 },
    { month: "Jun", delhi: 312, mumbai: 148, kolkata: 198, national: 178 },
  ],
  hourly: Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    aqi: Math.round(150 + 80 * Math.sin((i - 6) * Math.PI / 12) + (i * 3)),
    pm25: Math.round(70 + 40 * Math.sin((i - 6) * Math.PI / 12) + (i * 1.5)),
  })),
  hchoTrend: [
    { month: "Jan", hcho: 2.8, fires: 312 },
    { month: "Feb", hcho: 2.5, fires: 278 },
    { month: "Mar", hcho: 2.2, fires: 234 },
    { month: "Apr", hcho: 2.9, fires: 389 },
    { month: "May", hcho: 3.4, fires: 567 },
    { month: "Jun", hcho: 4.2, fires: 847 },
  ],
  pollutantBreakdown: [
    { name: "PM2.5", value: 38, fill: "#fb7185" },
    { name: "PM10", value: 24, fill: "#fbbf24" },
    { name: "NO₂", value: 18, fill: "#a78bfa" },
    { name: "O₃", value: 12, fill: "#34d399" },
    { name: "CO", value: 5, fill: "#22d3ee" },
    { name: "SO₂", value: 3, fill: "#fb923c" },
  ],
  stateAQI: [
    { state: "Delhi", aqi: 312, category: "Hazardous" },
    { state: "UP", aqi: 267, category: "Very Unhealthy" },
    { state: "Bihar", aqi: 242, category: "Very Unhealthy" },
    { state: "Punjab", aqi: 234, category: "Very Unhealthy" },
    { state: "Rajasthan", aqi: 224, category: "Very Unhealthy" },
    { state: "Haryana", aqi: 198, category: "Unhealthy" },
    { state: "Gujarat", aqi: 172, category: "Unhealthy" },
    { state: "MP", aqi: 148, category: "Unhealthy" },
  ],
};

// Historical data 1990–2026
export const historicalYearlyData = Array.from({ length: 37 }, (_, i) => {
  const year = 1990 + i;
  // COVID dip, otherwise rising trend peaking ~2018 then marginal improvements
  const base = year === 2020 ? 0.62 : year === 2021 ? 0.88 : Math.min(1.0, 0.32 + (i / 36) * 0.68);
  const yr = year;
  const stationsMonitored = yr < 1995 ? 45 : yr < 2005 ? 180 : yr < 2015 ? 420 : 847;
  return {
    year,
    delhi: Math.round(312 * base),
    mumbai: Math.round(148 * base),
    kolkata: Math.round(198 * base),
    national: Math.round(178 * base),
    pm25: Math.round(94 * base),
    fires: Math.round(847 * base),
    stations: stationsMonitored,
  };
});

export const satelliteData = [
  { name: 'Sentinel-5P', param: 'HCHO Column', since: 2017, status: 'Active' },
  { name: 'MODIS Terra', param: 'FRP Fire Spot', since: 2000, status: 'Active' },
  { name: 'MODIS Aqua', param: 'AOD Profile', since: 2002, status: 'Active' },
  { name: 'VIIRS NPP', param: 'Active Thermal', since: 2012, status: 'Active' },
  { name: 'INSAT-3DR', param: 'Meteorological', since: 2016, status: 'Active' },
];

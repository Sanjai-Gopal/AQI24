# AQI24 — Know tomorrow, understand what comes next

Environmental intelligence for India's air. AQI24 turns observations and real atmospheric models into a calm, honest view of what the air will do — and what it has done.

**What AQI24 is not:** a "live" telemetry dashboard with a continuous fake feed of numbers. We never fabricate AQI values. When a data source is unavailable or a figure is a modeled estimate, the app says so plainly.

## Pages

| Route | Page | What it does |
|---|---|---|
| `/` | Home | Today's station reading, tomorrow + 7-day forecast, research entry points |
| `/forecast` | Forecast | Detailed 7-day outlook, methodology disclosure, health guidance |
| `/history` | Explore the Past | 1990–2026 modeled reference, city-vs-national trends, seasonal patterns, export |
| `/map` | Map | Current WAQI station readings / NASA FIRMS active fires, layer toggle |
| `/research` | Research hub | Data sources, satellite datasets, subpage index |
| `/research/methodology` | Methodology | How every number is produced — no black boxes |
| `/research/indicators` | Air quality indicators | Formaldehyde hotspot reference geometry |
| `/research/models` | Model information | Fire intensity regressor + severity classifier experiments |
| `/research/analytics` | Analytics | Historical analytical view |
| `/research/about` | About | The project and its data-honesty principles |
| `/login`, `/my-locations`, `/profile` | Account | Optional sign-in + saved locations |

## Data sources

| Data | Source | Credentials |
|---|---|---|
| Current station AQI | WAQI (`api.waqi.info`) | `VITE_WAQI_API_TOKEN` |
| Active fires | NASA FIRMS (MODIS/VIIRS) | `VITE_NASA_FIRMS_MAP_KEY` |
| 7-day forecast | Open-Meteo CAMS global air quality model | none |
| Historical 1990–2026 | CPCB annual-report baselines + NCAP targets, interpolated — **modeled estimate**, labeled as such in the UI | none |

Forecast AQI is computed from the CAMS PM2.5 forecast using the standard EPA breakpoints (`pm25ToAQI` in `src/utils/aqiUtils.js`). Historical values are clearly labeled "modeled estimate / reference" and are never presented as observations.

## Quick start

```bash
cp .env.example .env   # fill in keys (WAQI token is required for live data)
npm install
npm run dev            # http://localhost:3000
npm run build          # production build
npm run preview        # serve the production build locally
npm run lint           # TypeScript type-check (tsc --noEmit)
```

Without keys the app still runs: source pages show honest "not configured / unavailable" states with links to obtain credentials. No fabricated fallback data.

## Environment variables (`.env`)

```env
VITE_WAQI_API_TOKEN=        # aqicn.org/data-platform/token
VITE_NASA_FIRMS_MAP_KEY=    # firms.modaps.eosdis.nasa.gov/api/area/
VITE_SUPABASE_URL=          # optional — sign-in + saved locations
VITE_SUPABASE_ANON_KEY=     # optional
VITE_GEMINI_API_KEY=        # optional — AI assistance
```

## Architecture

```
Frontend (Vite + React + Leaflet + Recharts)
├── src/utils/api.js           — WAQI + NASA FIRMS + Open-Meteo clients
├── src/utils/aqiUtils.js      — EPA PM2.5→AQI, color/category helpers
├── src/utils/timelineUtils.js — Historical reference scaling (labeled as modeled)
├── src/utils/health.js        — Health guidance by AQI band
├── src/components/forecast/   — ForecastDashboard (Home + Forecast pages)
├── src/components/ui/         — LocationPicker, panels, charts
├── src/components/charts/     — ChartShell wrapper (prevents height=-1)
├── src/pages/                 — one component per route
└── src/context/               — LocationContext, AuthContext
```

## Data honesty principles

- **Never fabricate AQI values.** Current AQI only from WAQI; forecast AQI only from Open-Meteo CAMS via EPA conversion.
- **Modeled data is labeled.** Historical values are "modeled estimates/reference," never presented as raw observations.
- **Errors are shown, not hidden.** Missing API keys or failed requests render inline error banners with actions.
- **No fake metrics.** The fire models report RMSE/MAE/R² and accuracy computed on real held-out detections. An AQI24-trained AQI forecast model is planned future work — the current forecast is the Open-Meteo CAMS atmospheric model, labeled as such.

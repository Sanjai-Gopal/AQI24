# AQI24 — Air Quality Intelligence Platform

Production-grade research platform for satellite-derived air quality monitoring across India.

## Live API Integrations

| Feature | Source | Auth Required |
|---|---|---|
| Live AQI Map | WAQI India bounds feed | `VITE_WAQI_API_TOKEN` |
| Active Fires | NASA FIRMS MODIS/VIIRS CSV | `VITE_NASA_FIRMS_MAP_KEY` |
| 7-Day Forecast | Open-Meteo CAMS (free) | None |
| HCHO Hotspots | S5P reference + GEE pipeline | `COPERNICUS_USER/PASSWORD` |

## Quick Start

```bash
cp .env.example .env    # fill API keys
npm install
npm run dev             # http://localhost:3000
npm run build           # production build
npm run preview         # serve the production build locally
npm run lint            # TypeScript type-check (tsc --noEmit)
```

The dashboard includes a light/dark theme toggle in the top navigation bar; the choice is persisted in `localStorage`.

## Frontend Env Variables (`.env`)

```env
VITE_WAQI_API_TOKEN=        # aqicn.org/data-platform/token
VITE_NASA_FIRMS_MAP_KEY=    # firms.modaps.eosdis.nasa.gov/api/area/
VITE_SUPABASE_URL=          # Supabase project URL
VITE_SUPABASE_ANON_KEY=     # Supabase anon key
```

Without keys: graceful error banners with signup links. No crash, no fabricated fallback data.

## Full Data Pipeline

### Step 1: CPCB Data (download manually)
```
Download from: https://data.cpcb.gov.in
Format: CSV with PM2.5, PM10, NO2, SO2, CO, O3, AQI columns
Save to: data/cpcb_raw/*.csv

python backend/ingestion/cpcb_preprocess.py \
  --input data/cpcb_raw/ --output data/cpcb_clean/
```

### Step 2: Google Earth Engine Exports
```bash
pip install earthengine-api
earthengine authenticate

# Export all satellite datasets for a month to Google Drive:
python backend/gee/export_all.py --year 2024 --month 11

# Download from Google Drive > aqi24_exports/ into:
#   data/gee_exports/aod/
#   data/gee_exports/hcho/
#   data/gee_exports/no2/
#   data/gee_exports/so2/
#   data/gee_exports/co/
#   data/gee_exports/o3/
#   data/gee_exports/era5/
```

### Step 3: Merge Features
```bash
python backend/gee/merge_features.py
# Output: data/ml_ready/features.csv
```

### Step 4: Train ML Model
```bash
pip install -r backend/requirements.txt

python backend/ml/train.py \
  --data data/ml_ready/features.csv \
  --model xgboost    # or lightgbm / catboost

# Output: models/pm25_xgboost.joblib + models/model_meta.json
# Metrics (RMSE, MAE, R²) computed on real 20% held-out split
# SHAP feature importance saved to model_meta.json
```

### Step 5: Inference
```bash
# Single prediction:
python backend/ml/predict.py \
  --lat 28.65 --lon 77.23 --month 11 --aod 0.45

# Batch prediction:
python backend/ml/predict.py \
  --input data/ml_ready/features.csv \
  --output data/predictions.csv

# Inference API (FastAPI):
python backend/ml/predict.py --serve --port 8001
# GET  http://localhost:8001/model/info
# POST http://localhost:8001/predict
```

### Step 6: HCHO Hotspot Detection
```bash
python backend/ml/hcho_hotspots.py --date 2024-11-15
# Requires: S5P HCHO cache + FIRMS cache + ERA5 cache
```

### Step 7: Live Ingestion (production)
```bash
# Individual runs:
python backend/ingestion/waqi_ingest.py
python backend/ingestion/firms_ingest.py --source MODIS_NRT --days 1
python backend/ingestion/sentinel5p_ingest.py --product HCHO --date 20241115
python backend/ingestion/era5_ingest.py --year 2024 --month 11

# Automated scheduler:
python backend/scripts/scheduler.py
```

## Supabase Schema

Run `backend/supabase_schema.sql` in Supabase SQL Editor.

Tables: `aqi_observations`, `fire_events`, `hcho_observations`, `hcho_hotspots`, `era5_met`, `ml_predictions`, `model_metadata`, `stations`

## Architecture

```
Frontend (Vite + React + Leaflet + Recharts)
├── src/utils/api.js          — WAQI + NASA FIRMS + Open-Meteo clients
├── src/utils/aqiUtils.js     — EPA PM2.5→AQI (standard breakpoints)
├── src/utils/timelineUtils.js — Historical scaling (labeled as modeled)
└── src/components/charts/    — ChartShell wrapper prevents height=-1

Backend (Python)
├── ingestion/
│   ├── waqi_ingest.py        — WAQI → Supabase
│   ├── firms_ingest.py       — NASA FIRMS → Supabase
│   ├── sentinel5p_ingest.py  — S5P TROPOMI → Supabase
│   ├── era5_ingest.py        — ERA5 → Supabase
│   └── cpcb_preprocess.py   — CPCB CSV → ML labels
├── gee/
│   ├── export_all.py         — GEE export scripts (AOD/HCHO/NO2/SO2/CO/O3/ERA5)
│   └── merge_features.py    — Spatial join GEE + CPCB → features.csv
├── ml/
│   ├── train.py              — XGBoost/LightGBM/CatBoost + SHAP
│   ├── predict.py            — Inference CLI + FastAPI server
│   └── hcho_hotspots.py     — Hotspot detection pipeline
├── scripts/scheduler.py      — Automated ingestion (schedule library)
└── supabase_schema.sql       — Full schema with indexes + RLS
```

## Data Science Notes

**AQI conversion**: EPA standard linear interpolation (AQI Technical Assistance Document, Aug 2016). PM2.5 truncated to 1 decimal before lookup. No approximations.

**Historical data**: Values from 1990–2026 are interpolated estimates from CPCB annual report baselines and NCAP targets. Clearly labeled as "Modeled" throughout the UI. Not raw observations.

**ML metrics**: RMSE, MAE, R² are only computed after real training on CPCB data. No fabricated metrics exist in the codebase.

**HCHO hotspots**: Reference geometry from 12 known burning/industrial corridors. Data-driven values require S5P TROPOMI ingestion.

## All Fixes Applied

- ✅ `yr < 11995` typo → `yr < 1995`
- ✅ `pm25 * 4.2` → EPA standard breakpoints
- ✅ All `undefined.map()` crashes → `Array.isArray()` guards + ChartShell wrapper
- ✅ Recharts `width/height=-1` → `minHeight` in ChartShell
- ✅ `HCHOFireChart` used `Line` in `BarChart` → `ComposedChart`
- ✅ FireMap re-fetching internally → uses `fires` prop directly
- ✅ HCHOMap re-fetching internally → uses `hotspots` prop directly
- ✅ Fabricated `R²=0.92` in MethodologyPage → "Pending — train with CPCB data"
- ✅ `getTrendDataForYear` missing `stateAQI/hourly/pollutantBreakdown` → all added with safe defaults
- ✅ `MapResizer` memory leak → proper `clearTimeout` cleanup
- ✅ Duplicate `center/zoom` on `MapContainer` → only `MapController` sets view
- ✅ Random noise in `historicalYearlyData` → deterministic
- ✅ `Math.random()` in forecast fallback → removed; error state shown
- ✅ ErrorBoundary wraps all lazy-loaded pages
- ✅ GEE export scripts for all 7 datasets
- ✅ Spatial join merger (`merge_features.py`)
- ✅ `predict.py` with CLI, batch mode, FastAPI server
- ✅ Supabase schema with 8 tables, indexes, RLS

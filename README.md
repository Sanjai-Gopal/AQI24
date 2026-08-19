<div align="center">

# AQI24

### Know tomorrow. Understand what comes next.

**Environmental intelligence for India's air.**

<a href="https://aqi-24.vercel.app/">
  <img
    src="https://raw.githubusercontent.com/Sanjai-Gopal/AQI24/main/docs/aqi24-preview.png"
    alt="AQI24 Live Preview"
    width="92%"
  />
</a>

<br><br>

<a href="https://aqi-24.vercel.app/">
  <img
    src="https://img.shields.io/badge/LIVE%20DEMO-Visit%20AQI24-111111?style=for-the-badge&logo=vercel&logoColor=white"
    alt="Live Demo"
  />
</a>

</div>

---

## 🌍 About

**AQI24** is an environmental intelligence platform built to help people understand **what the air is like now, what may happen next, and how air quality has changed over time**.

It combines:

* Current air-quality observations
* Atmospheric forecasts
* Historical references
* Satellite and active-fire data
* Environmental analytics
* Research and methodology

The platform is designed around one principle:

> **Be useful without pretending that uncertain data is certain.**

---

## ✦ What AQI24 Does

| Area            | Purpose                                              |
| --------------- | ---------------------------------------------------- |
| **Current AQI** | View station-based air-quality observations          |
| **Forecast**    | Explore tomorrow and 7-day atmospheric outlooks      |
| **History**     | Understand long-term and seasonal patterns           |
| **Map**         | Explore AQI stations and active fire locations       |
| **Research**    | Explore datasets, methodology, models and indicators |
| **Health**      | Understand health guidance for AQI categories        |
| **Accounts**    | Save locations and personalize the experience        |

---

## 🔬 Data You Can Trust

AQI24 is intentionally designed **not to fabricate environmental data**.

### Observed data

Current station readings are sourced from **WAQI**.

### Forecast data

The 7-day forecast uses **Open-Meteo CAMS** atmospheric forecasts.

Forecast AQI is derived from forecast PM2.5 values using **EPA AQI breakpoints**.

### Historical data

Historical 1990–2026 values are based on **CPCB annual-report baselines and NCAP targets** and are treated as **modeled estimates/reference values**, not raw observations.

### Active fires

Fire information is sourced from **NASA FIRMS** using MODIS/VIIRS data.

> When a source is unavailable, missing, or modeled, AQI24 says so instead of filling the interface with fabricated numbers.

---

## 🧠 ML & Research

AQI24 is also an evolving **AI/ML experimentation platform**.

Current research areas include:

* Fire intensity regression
* Fire severity classification
* Historical environmental analytics
* ML/DL experimentation for environmental intelligence

### Forecasting status

The current AQI forecast is based on the **Open-Meteo CAMS atmospheric model**.

An AQI24-trained AQI forecasting model is **future work** and is not presented as an existing production model.

---

## 🗺️ Explore AQI24

```text
/
├── Home
│   ├── Current station reading
│   ├── Tomorrow's outlook
│   └── 7-day forecast
│
├── /forecast
│   └── Detailed forecast + methodology
│
├── /history
│   └── Historical trends + seasonal analysis
│
├── /map
│   └── AQI stations + active fires
│
└── /research
    ├── methodology
    ├── indicators
    ├── models
    ├── analytics
    └── about
```

Optional account routes include:

```text
/login
/my-locations
/profile
```

---

## 🛠 Technology

### Frontend

`Vite` · `React`

### Visualization

`Leaflet` · `Recharts`

### Backend / Services

`Supabase`

### Data Sources

`WAQI` · `NASA FIRMS` · `Open-Meteo CAMS` · `CPCB`

### AI / Research

`Machine Learning` · `Deep Learning` · `Environmental Analytics`

---

## ⚙️ Environment Variables

Create a `.env` file:

```env
VITE_WAQI_API_TOKEN=
VITE_NASA_FIRMS_MAP_KEY=

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

VITE_GEMINI_API_KEY=
```

### Required

`VITE_WAQI_API_TOKEN`

is required for live WAQI station data.

### Optional

Supabase credentials enable account functionality such as authentication and saved locations.

Gemini integration is optional.

> AQI24 can still run without optional credentials and shows clear **unavailable / not configured** states instead of fabricated fallback values.

---

## 🚀 Run Locally

```bash
git clone https://github.com/Sanjai-Gopal/AQI24.git
cd AQI24

npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production build

```bash
npm run build
npm run preview
```

### Type check / lint

```bash
npm run lint
```

---

## 📊 Core Architecture

```text
                     AQI24
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
      WAQI        Open-Meteo      NASA FIRMS
   Station AQI      CAMS          Active Fires
        │              │              │
        └──────────────┼──────────────┘
                       ↓
                 AQI24 Data Layer
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   AQI Utilities   Forecasting    Analytics
        │              │              │
        └──────────────┼──────────────┘
                       ↓
                React Application
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
      Charts          Maps          Research
```

---

## ✨ Why AQI24?

AQI24 is designed around a different idea:

**Don't just show a number. Explain where it came from.**

That means:

**Observed** → shown as observed
**Forecast** → shown as forecast
**Modeled** → clearly labeled as modeled
**Unavailable** → shown as unavailable

No hidden data substitution.
No fake live feeds.
No invented AQI values.

---

## 🌐 Live Project

### [Open AQI24 →](https://aqi-24.vercel.app/)

**Repository:**
https://github.com/Sanjai-Gopal/AQI24

---

<div align="center">

### Built for environmental intelligence.

**Data • Research • Prediction • Transparency**

</div>

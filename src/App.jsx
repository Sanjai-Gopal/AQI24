import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/layout/Navbar';
import TimelineSyncBar from './components/ui/TimelineSyncBar';
import ErrorBoundary from './components/ui/ErrorBoundary';
import './index.css';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AQIMapPage = lazy(() => import('./pages/AQIMapPage'));
const HCHOPage = lazy(() => import('./pages/HCHOPage'));
const FirePage = lazy(() => import('./pages/FirePage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const HistoricalPage = lazy(() => import('./pages/HistoricalPage'));
const ForecastPage = lazy(() => import('./pages/ForecastPage'));
const MethodologyPage = lazy(() => import('./pages/MethodologyPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const MLPage = lazy(() => import('./pages/MLPage'));

const pages = {
  landing: LandingPage,
  dashboard: DashboardPage,
  aqimap: AQIMapPage,
  hcho: HCHOPage,
  fire: FirePage,
  analytics: AnalyticsPage,
  historical: HistoricalPage,
  forecast: ForecastPage,
  methodology: MethodologyPage,
  about: AboutPage,
  ml: MLPage,
};

// Human-readable titles for the document <title> and the screen-reader page
// announcer — this app switches "pages" via state rather than real routes,
// so without this, assistive tech and the browser tab give no signal that
// navigation happened.
const PAGE_TITLES = {
  landing: 'AQI24 — Surface AQI & HCHO Platform',
  dashboard: 'Dashboard · AQI24',
  aqimap: 'AQI Map · AQI24',
  hcho: 'HCHO Hotspots · AQI24',
  fire: 'Active Fires · AQI24',
  analytics: 'Analytics · AQI24',
  historical: 'Historical Trends · AQI24',
  forecast: 'Forecast · AQI24',
  methodology: 'Methodology · AQI24',
  about: 'About · AQI24',
  ml: 'ML Model · AQI24',
};

// Per-section meta descriptions — synced to the <meta name="description"> tag
// on navigation (this app has no real routes, so the SPA must do it manually).
const PAGE_DESCRIPTIONS = {
  landing: 'AQI24 — India\u2019s satellite-fused Air Quality Intelligence Platform. Surface AQI prediction, HCHO hotspot detection, and active fire tracking.',
  dashboard: 'Live national AQI dashboard for India — real-time station readings, weather conditions, health advice, and worst-affected cities.',
  aqimap: 'Interactive India AQI map with live WAQI station telemetry and historically modeled year-by-year estimates.',
  hcho: 'Formaldehyde (HCHO) column density hotspots from Sentinel-5P TROPOMI — biomass burning and industrial VOC proxy.',
  fire: 'Active fire tracking from NASA FIRMS VIIRS S-NPP — thermal anomalies and radiative power across India.',
  analytics: 'Multi-sensor correlation analytics: AQI trends, HCHO columns vs active fires, pollutant composition, and state rankings.',
  historical: 'Long-term AQI trend analysis for India (1980–2026) with MERRA-2 reanalysis baseline estimates and fire counts.',
  forecast: 'PM2.5 and AQI forecasts from Open-Meteo CAMS — EPA-standard AQI computation for Indian cities.',
  methodology: 'How AQI24 fuses satellite, station, and ML data — sources, processing pipelines, and uncertainty.',
  about: 'About the AQI24 team and mission.',
  ml: 'Fire Radiative Power prediction — ConvLSTM + Attention and XGBoost models trained on 8.6M NASA FIRMS fire detections.',
};

function PageSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="skeleton h-8 w-64 rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
      </div>
      <div className="skeleton h-72 rounded-2xl" />
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState('landing');
  const [selectedYear, setSelectedYear] = useState('Live');
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    if (saved === 'light') document.body.classList.add('light-theme');
    else document.body.classList.remove('light-theme');
    return saved;
  });
  const mainRef = useRef(null);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      if (next === 'light') document.body.classList.add('light-theme');
      else document.body.classList.remove('light-theme');
      return next;
    });
  };

  const navigate = (section) => setActiveSection(section || 'dashboard');
  const PageComponent = pages[activeSection] || DashboardPage;
  const pageTitle = PAGE_TITLES[activeSection] || PAGE_TITLES.dashboard;
  const pageDescription = PAGE_DESCRIPTIONS[activeSection] || PAGE_DESCRIPTIONS.dashboard;
  const isLanding = activeSection === 'landing';

  // Keep the browser tab title in sync, and move focus to the new "page" for
  // keyboard and screen-reader users on every navigation (since there is no
  // real route change for the browser to announce on its own).
  useEffect(() => {
    document.title = pageTitle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', pageDescription);
    if (mainRef.current) mainRef.current.focus({ preventScroll: false });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeSection, pageTitle, pageDescription]);

  return (
    <div className="min-h-screen bg-space-950 scanline-overlay">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <Navbar activeSection={activeSection} onNav={navigate} theme={theme} onToggleTheme={toggleTheme} overlay={isLanding} />

      {/* Visually-hidden live region announcing page changes to assistive tech */}
      <div aria-live="polite" className="sr-only">{pageTitle}</div>

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className={isLanding ? 'outline-none' : 'pt-14 pb-28 sm:pb-32 outline-none'}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <ErrorBoundary key={activeSection}>
              <Suspense fallback={<PageSkeleton />}>
                <PageComponent
                  onEnter={navigate}
                  onNav={navigate}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>

      {!isLanding && (
        <div className="fixed bottom-3 left-3 right-3 z-40 max-w-screen-2xl mx-auto">
          <TimelineSyncBar selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
        </div>
      )}
    </div>
  );
}

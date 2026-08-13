import { useEffect, lazy, Suspense, useState, useRef } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/auth/RequireAuth';
import './index.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const ForecastPage = lazy(() => import('./pages/ForecastPage'));
const HistoricalPage = lazy(() => import('./pages/HistoricalPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const ResearchPage = lazy(() => import('./pages/ResearchPage'));
const MethodologyPage = lazy(() => import('./pages/MethodologyPage'));
const HCHOPage = lazy(() => import('./pages/HCHOPage'));
const MLPage = lazy(() => import('./pages/MLPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const MyLocationsPage = lazy(() => import('./pages/MyLocationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

const TITLES = {
  '/': 'AQI24 — Know tomorrow',
  '/forecast': 'Forecast · AQI24',
  '/history': 'Explore the Past · AQI24',
  '/map': 'Map · AQI24',
  '/research': 'Research & Data · AQI24',
  '/research/methodology': 'Methodology · AQI24',
  '/research/indicators': 'Air quality indicators · AQI24',
  '/research/models': 'Model information · AQI24',
  '/research/analytics': 'Trends & Analytics · AQI24',
  '/research/about': 'About · AQI24',
  '/login': 'Sign in · AQI24',
  '/my-locations': 'My Locations · AQI24',
  '/profile': 'Profile · AQI24',
};

const DESCRIPTIONS = {
  '/': 'AQI24 shows you what the weather and air quality around you could look like tomorrow and in the days ahead — built from historical patterns, recent observations and real atmospheric models.',
  '/forecast': 'Air quality and weather outlook for the coming days — AQI, PM2.5, temperature, humidity, wind and rain.',
  '/history': 'Explore how the air quality and weather in your area have changed over the years.',
  '/map': 'Explore air quality and fire activity across India on an interactive map.',
  '/research': 'Data sources, methodology, model information and historical datasets for researchers.',
  '/login': 'Sign in to AQI24 to save your places and get more from your forecast.',
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

function AppShell() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('light-theme', saved === 'light');
    return saved;
  });
  const mainRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    document.title = TITLES[location.pathname] || TITLES['/'];
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', DESCRIPTIONS[location.pathname] || DESCRIPTIONS['/']);
    if (mainRef.current) mainRef.current.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      document.body.classList.toggle('light-theme', next === 'light');
      return next;
    });
  };

  return (
    <div className="min-h-screen relative">
      <div className="atmos-bg" aria-hidden="true" />
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      {/* Visually-hidden live region announcing page changes to assistive tech */}
      <div aria-live="polite" className="sr-only">{TITLES[location.pathname] || TITLES['/']}</div>

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="pt-14 pb-24 outline-none"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <ErrorBoundary key={location.pathname}>
              <Suspense fallback={<PageSkeleton />}>
                <Routes location={location}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/forecast" element={<ForecastPage />} />
                  <Route path="/history" element={<HistoricalPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/research" element={<ResearchPage />} />
                  <Route path="/research/methodology" element={<MethodologyPage />} />
                  <Route path="/research/indicators" element={<HCHOPage />} />
                  <Route path="/research/models" element={<MLPage />} />
                  <Route path="/research/analytics" element={<AnalyticsPage />} />
                  <Route path="/research/about" element={<AboutPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/my-locations" element={<RequireAuth><MyLocationsPage /></RequireAuth>} />
                  <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <LocationProvider>
          <AppShell />
        </LocationProvider>
      </AuthProvider>
    </HashRouter>
  );
}

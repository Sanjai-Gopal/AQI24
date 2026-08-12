import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home, CloudSun, History, Map as MapIcon, FlaskConical, Sun, Moon, User, MapPin, LogIn, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Forecast', to: '/forecast', icon: CloudSun },
  { label: 'History', to: '/history', icon: History },
  { label: 'Map', to: '/map', icon: MapIcon },
  { label: 'Research', to: '/research', icon: FlaskConical },
];

const accountItems = [
  { label: 'My Locations', to: '/my-locations', icon: MapPin },
  { label: 'Profile', to: '/profile', icon: User },
];

export default function Navbar({ theme, onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, configured, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const frosted = scrolled;

  const close = () => setMobileOpen(false);

  const goAndClose = (to) => {
    close();
    navigate(to);
  };

  return (
    <nav
      aria-label="Primary"
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: frosted ? 'var(--nav-bg)' : 'transparent',
        backdropFilter: frosted ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: frosted ? 'blur(16px)' : 'none',
        borderBottom: frosted ? '1px solid var(--panel-border)' : '1px solid transparent',
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2.5 cursor-pointer group"
          aria-label="AQI24 home"
        >
          <div className="relative">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all group-hover:scale-105 shadow-sm"
              style={{ background: 'linear-gradient(135deg, rgba(13,134,222,0.14), rgba(59,130,246,0.10))', border: '1px solid var(--panel-border)' }}
            >
              <Sparkles size={16} className="text-sky-500" aria-hidden="true" />
            </div>
          </div>
          <div>
            <div className="font-semibold text-sm leading-none tracking-wide" style={{ color: 'var(--text-main)' }}>
              AQI<span className="text-sky-500">24</span>
            </div>
            <div className="text-[10px] leading-none mt-1" style={{ color: 'var(--text-faint)' }}>Know tomorrow</div>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `nav-link relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'text-sky-600 bg-sky-500/10 border border-sky-500/25'
                      : 'text-slate-500 hover:text-sky-600 hover:bg-sky-500/5 border border-transparent'
                  }`
                }
              >
                <Icon size={12} aria-hidden="true" />
                {item.label}
                <span className="nav-underline" aria-hidden="true" />
              </NavLink>
            );
          })}
        </div>

        {/* Right cluster */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            aria-label={theme === 'light' ? 'Switch to night theme' : 'Switch to day theme'}
            className="p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-center text-sky-600 hover:text-sky-700 bg-sky-500/10 hover:bg-sky-500/20"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            {theme === 'light' ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-1">
              {accountItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive ? 'text-emerald-600 bg-emerald-500/10' : 'text-slate-500 hover:text-sky-600 hover:bg-sky-500/5'
                      }`
                    }
                  >
                    <Icon size={12} aria-hidden="true" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          ) : (
            <NavLink
              to="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 transition-all shadow-md"
            >
              <LogIn size={12} aria-hidden="true" />
              Sign in
            </NavLink>
          )}

          {configured && !isAuthenticated && (
            <span className="sr-only">Sign in for saved locations and downloads</span>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onToggleTheme}
            aria-label={theme === 'light' ? 'Switch to night theme' : 'Switch to day theme'}
            className="p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-center text-sky-600 bg-sky-500/10"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            {theme === 'light' ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
          </button>
          <button
            className="p-1 cursor-pointer"
            style={{ color: 'var(--text-sub)' }}
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
          >
            {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--panel-border)' }}
            className="lg:hidden overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1 pb-5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.to}
                    onClick={() => goAndClose(item.to)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
                    style={{ color: 'var(--text-sub)' }}
                  >
                    <Icon size={14} className="text-sky-500" aria-hidden="true" />
                    {item.label}
                  </button>
                );
              })}
              <div className="my-2" style={{ borderTop: '1px solid var(--panel-border)' }} />
              {isAuthenticated ? (
                <>
                  {accountItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.to}
                        onClick={() => goAndClose(item.to)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
                        style={{ color: 'var(--text-sub)' }}
                      >
                        <Icon size={14} className="text-emerald-500" aria-hidden="true" />
                        {item.label}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => { close(); signOut(); navigate('/'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
                    style={{ color: 'var(--text-sub)' }}
                  >
                    <LogOut size={14} className="text-rose-500" aria-hidden="true" />
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => goAndClose('/login')}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-600 transition-all"
                >
                  <LogIn size={14} aria-hidden="true" />
                  Sign in
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

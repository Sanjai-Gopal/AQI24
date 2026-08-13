import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home, CloudSun, History, Map as MapIcon, FlaskConical, Sun, Moon, User, MapPin, LogIn, LogOut, Sparkles, ChevronDown } from 'lucide-react';
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
  { label: 'Account', to: '/profile', icon: User },
];

export default function Navbar({ theme, onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const accountRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, configured, signOut, session } = useAuth();

  const user = session?.user || null;
  const displayName =
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'Guest');
  const initial = (displayName || 'G').trim().charAt(0).toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!accountOpen) return;
    const onDown = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setAccountOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountOpen]);

  const frosted = scrolled;

  const close = () => setMobileOpen(false);

  const goAndClose = (to) => {
    close();
    navigate(to);
  };

  const handleSignOut = async () => {
    close();
    setAccountOpen(false);
    await signOut();
    navigate('/');
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
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                aria-label={`Account menu for ${displayName}`}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border transition-all cursor-pointer hover:bg-sky-500/5"
                style={{ borderColor: 'var(--panel-border)', background: 'rgba(255,255,255,0.03)' }}
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg,#22d3ee,#0d86de)', color: '#08111f' }}
                >
                  {initial}
                </span>
                <span className="max-w-[8rem] truncate text-xs font-semibold hidden xl:block" style={{ color: 'var(--text-sub)' }}>
                  {displayName}
                </span>
                <ChevronDown
                  size={13}
                  className={`transition-transform ${accountOpen ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--text-faint)' }}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    role="menu"
                    aria-label="Account menu"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-[calc(100%+10px)] w-60 rounded-2xl p-2 shadow-lg z-50"
                    style={{ background: 'var(--nav-bg)', border: '1px solid var(--panel-border)', backdropFilter: 'blur(20px)' }}
                  >
                    <div className="px-3 py-2.5 mb-1 border-b" style={{ borderColor: 'var(--panel-border)' }}>
                      <div className="text-xs font-bold truncate" style={{ color: 'var(--text-main)' }}>{displayName}</div>
                      <div className="text-[10px] truncate mt-0.5" style={{ color: 'var(--text-faint)' }}>{user?.email || 'Signed in to AQI24'}</div>
                    </div>
                    {accountItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          role="menuitem"
                          onClick={() => setAccountOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                              isActive ? 'text-emerald-600 bg-emerald-500/10' : 'text-slate-500 hover:text-sky-600 hover:bg-sky-500/5'
                            }`
                          }
                        >
                          <Icon size={13} aria-hidden="true" /> {item.label}
                        </NavLink>
                      );
                    })}
                    <div className="my-1" style={{ borderTop: '1px solid var(--panel-border)' }} />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer text-rose-400 hover:bg-rose-500/10 text-left"
                    >
                      <LogOut size={13} aria-hidden="true" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
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
              {isAuthenticated && (
                <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg,#22d3ee,#0d86de)', color: '#08111f' }}
                  >
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate" style={{ color: 'var(--text-main)' }}>{displayName}</div>
                    <div className="text-[10px] truncate" style={{ color: 'var(--text-faint)' }}>{user?.email || 'Signed in'}</div>
                  </div>
                </div>
              )}
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
                    onClick={handleSignOut}
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

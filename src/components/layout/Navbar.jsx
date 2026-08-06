import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Satellite, Menu, X, Activity, Wind, Flame, ChartBar as BarChart3, BookOpen, Users, LayoutDashboard, Sun, Moon, History, Brain } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { label: 'AQI Map', icon: Wind, key: 'aqimap' },
  { label: 'Forecast', icon: Brain, key: 'forecast' },
  { label: 'HCHO', icon: Activity, key: 'hcho' },
  { label: 'Fire', icon: Flame, key: 'fire' },
  { label: 'Analytics', icon: BarChart3, key: 'analytics' },
  { label: 'Historical', icon: History, key: 'historical' },
  { label: 'ML Model', icon: Brain, key: 'ml' },
  { label: 'Methodology', icon: BookOpen, key: 'methodology' },
  { label: 'About', icon: Users, key: 'about' },
];

export default function Navbar({ activeSection, onNav, theme, onToggleTheme, overlay = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // On the landing page the nav floats over the hero: transparent until the
  // user scrolls, then it frosts over for legibility.
  useEffect(() => {
    if (!overlay) { setScrolled(true); return; }
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overlay]);

  const frosted = overlay ? scrolled : true;

  return (
    <nav
      aria-label="Primary"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${overlay ? '' : 'shadow-[0_1px_0_0_var(--panel-border)]'}`}
      style={{
        background: frosted ? 'var(--nav-bg)' : 'transparent',
        backdropFilter: frosted ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: frosted ? 'blur(16px)' : 'none',
        borderBottom: frosted ? '1px solid var(--panel-border)' : '1px solid transparent',
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <motion.button
          type="button"
          className="flex items-center gap-3 cursor-pointer"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => onNav('landing')}
          aria-label="AQI24 home"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(8,145,178,0.1))', border: '1px solid var(--panel-border)' }}>
              <Satellite size={16} className="text-cyan-400" aria-hidden="true" />
            </div>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-none tracking-wide">AQI<span className="text-cyan-400">24</span></div>
            <div className="text-slate-500 text-xs font-mono leading-none mt-0.5">AIR · IQ</div>
          </div>
        </motion.button>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;
            return (
              <motion.button
                key={item.key}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onNav(item.key)}
                aria-current={isActive ? 'page' : undefined}
                className={`nav-link group relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                  isActive ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/25' : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/5 border border-transparent'
                }`}
              >
                <Icon size={12} aria-hidden="true" />
                {item.label}
                <span className="nav-underline" aria-hidden="true" />
              </motion.button>
            );
          })}
        </div>

        {/* Right cluster */}
        <div className="hidden lg:flex items-center gap-3">
          <button onClick={onToggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            className="p-1.5 rounded-lg border cursor-pointer transition-all flex items-center justify-center text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20"
            style={{ borderColor: 'var(--panel-border)' }}>
            {theme === 'light' ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}>
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" aria-hidden="true" />
            <span className="text-emerald-400 text-xs font-mono">LIVE</span>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <button onClick={onToggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            className="p-1.5 rounded-lg border cursor-pointer transition-all flex items-center justify-center text-cyan-400 bg-cyan-400/10"
            style={{ borderColor: 'var(--panel-border)' }}>
            {theme === 'light' ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
          </button>
          <button
            className="text-slate-400 hover:text-white cursor-pointer p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
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
            <div className="px-4 py-2 grid grid-cols-2 gap-1.5 pb-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => { onNav(item.key); setMobileOpen(false); }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                      isActive ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={14} className="text-cyan-400" aria-hidden="true" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

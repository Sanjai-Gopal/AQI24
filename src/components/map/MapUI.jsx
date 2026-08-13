import { X } from 'lucide-react';

/** Frosted-glass panel shell used for every floating map control. */
export function MapPanel({ children, className = '', style = {}, ...rest }) {
  return (
    <div
      className={`pointer-events-auto rounded-xl backdrop-blur-md shadow-lg transition-colors ${className}`}
      style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Standard 4-up satellite/thermal-or-dark/street style switcher. */
export function MapStyleSwitcher({ options, value, onChange }) {
  return (
    <MapPanel role="group" aria-label="Map base layer" className="flex gap-1 p-1 rounded-xl">
      {options.map(({ key, Icon, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          aria-label={`${label} basemap`}
          title={label}
          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all flex items-center gap-1 ${
            value === key
              ? 'bg-[var(--brand-cyan)]/20 text-[var(--brand-cyan)] border border-[var(--brand-cyan)]/35'
              : 'text-[var(--text-faint)] hover:text-[var(--text-main)] hover:bg-[var(--text-main)]/5 border border-transparent'
          }`}
        >
          <Icon size={11} aria-hidden="true" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </MapPanel>
  );
}

/** Small bottom-corner readout, e.g. "42 / 120 stations". */
export function MapCountBadge({ children, accent = '#64748b' }) {
  return (
    <MapPanel className="text-[10px] font-mono px-2.5 py-1.5 rounded-lg flex items-center gap-2" style={{ color: accent }}>
      {children}
    </MapPanel>
  );
}

/** Consistent circular dismiss button used by every detail/inspector panel. */
export function MapCloseButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-faint)] hover:text-[var(--text-main)] hover:bg-[var(--text-main)]/10 transition-all"
    >
      <X size={13} aria-hidden="true" />
    </button>
  );
}

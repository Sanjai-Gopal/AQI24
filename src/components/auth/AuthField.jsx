import { useId } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Labeled input field used across the AQI24 authentication card.
 * Renders a visible label, an optional leading icon, an error state and a
 * matching hint. Fully keyboard-accessible with proper ARIA wiring.
 */
export default function AuthField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  hint,
  autoComplete,
  icon: Icon,
  autoFocus = false,
  inputMode,
  maxLength,
}) {
  const autoId = useId();
  const fieldId = id || autoId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className="auth-field-group">
      <label htmlFor={fieldId} className="auth-field-label">
        {label} <span className="sr-only">required</span>
      </label>
      <div className={`auth-field${error ? ' auth-field--error' : ''}`}>
        {Icon && <Icon size={15} className="auth-field-icon" aria-hidden="true" />}
        <input
          id={fieldId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          inputMode={inputMode}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className="auth-field-input"
        />
      </div>
      {hint && !error && (
        <p id={hintId} className="auth-field-hint">{hint}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="field-error">
          <AlertCircle size={12} className="shrink-0 mt-px" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

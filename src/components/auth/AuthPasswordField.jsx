import { useState, useId } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import PasswordStrengthMeter from './PasswordStrengthMeter';

/**
 * Password input with a show / hide toggle and an optional live password
 * strength meter (used on the create-account form).
 */
export default function AuthPasswordField({
  id,
  label = 'Password',
  value,
  onChange,
  placeholder = '••••••••',
  error,
  hint,
  autoComplete = 'current-password',
  showStrength = false,
}) {
  const autoId = useId();
  const fieldId = id || autoId;
  const errorId = `${fieldId}-error`;
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-field-group">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={fieldId} className="auth-field-label">
          {label} <span className="sr-only">required</span>
        </label>
        {hint && <span className="auth-field-hint">{hint}</span>}
      </div>
      <div className={`auth-field${error ? ' auth-field--error' : ''}`}>
        <Lock size={15} className="auth-field-icon" aria-hidden="true" />
        <input
          id={fieldId}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="auth-field-input"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="auth-field-eye"
          tabIndex={0}
        >
          {visible ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
        </button>
      </div>
      {showStrength && <PasswordStrengthMeter password={value} />}
      {error && (
        <p id={errorId} role="alert" className="field-error">
          <AlertCircle size={12} className="shrink-0 mt-px" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

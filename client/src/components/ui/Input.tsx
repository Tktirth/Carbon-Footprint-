import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  error?: string;
  helperText?: string;
  onChange: (value: string) => void;
}

export default function Input({
  label,
  error,
  helperText,
  id,
  required,
  className = '',
  onChange,
  ...props
}: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-300"
      >
        {label}
        {required && <span className="text-emerald-400 ml-1" aria-hidden="true">*</span>}
      </label>
      <input
        id={inputId}
        className={`glass-input ${
          error
            ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
            : ''
        }`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={
          error ? errorId : helperText ? helperId : undefined
        }
        aria-required={required}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-400 flex items-center gap-1" role="alert">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

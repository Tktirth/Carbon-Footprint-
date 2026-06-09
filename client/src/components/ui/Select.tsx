import React from 'react';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  id?: string;
  className?: string;
}

export default function Select({
  label,
  options,
  value,
  onChange,
  error,
  required,
  id,
  className = '',
}: SelectProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${selectId}-error`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-gray-300"
      >
        {label}
        {required && <span className="text-emerald-400 ml-1" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`glass-input appearance-none pr-10 cursor-pointer ${
            error
              ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
              : ''
          }`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-required={required}
        >
          <option value="" className="bg-dark-800 text-gray-400">
            Select an option
          </option>
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-dark-800 text-white"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {error && (
        <p id={errorId} className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

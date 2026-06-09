import React from 'react';

interface ProgressBarProps {
  value: number;
  label?: string;
  color?: 'emerald' | 'blue' | 'amber' | 'red' | 'violet' | 'cyan';
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorGradients = {
  emerald: 'from-emerald-500 to-emerald-400',
  blue: 'from-blue-500 to-blue-400',
  amber: 'from-amber-500 to-amber-400',
  red: 'from-red-500 to-red-400',
  violet: 'from-violet-500 to-violet-400',
  cyan: 'from-cyan-500 to-cyan-400',
};

const colorShadows = {
  emerald: 'shadow-emerald-500/30',
  blue: 'shadow-blue-500/30',
  amber: 'shadow-amber-500/30',
  red: 'shadow-red-500/30',
  violet: 'shadow-violet-500/30',
  cyan: 'shadow-cyan-500/30',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export default function ProgressBar({
  value,
  label,
  color = 'emerald',
  showPercentage = true,
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-gray-400">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-semibold text-white">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-white/5 rounded-full overflow-hidden ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-r ${colorGradients[color]} shadow-lg ${colorShadows[color]} transition-all duration-700 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}

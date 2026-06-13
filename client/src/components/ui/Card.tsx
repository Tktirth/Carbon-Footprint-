import { type ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  accent?: 'emerald' | 'blue' | 'amber' | 'red' | 'violet' | 'cyan';
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const accentColors = {
  emerald: 'border-t-emerald-500',
  blue: 'border-t-blue-500',
  amber: 'border-t-amber-500',
  red: 'border-t-red-500',
  violet: 'border-t-violet-500',
  cyan: 'border-t-cyan-500',
};

const paddingClasses = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({
  title,
  subtitle,
  children,
  className = '',
  accent,
  hoverable = false,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={`
        glass-card ${paddingClasses[padding]}
        ${accent ? `border-t-2 ${accentColors[accent]}` : ''}
        ${hoverable ? 'transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-xl hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

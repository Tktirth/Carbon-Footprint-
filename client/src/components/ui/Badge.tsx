import React from 'react';

interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses = {
  success: 'text-green-400 bg-green-400/10 border border-green-400/20',
  warning: 'text-amber-400 bg-amber-400/10 border border-amber-400/20',
  danger: 'text-red-400 bg-red-400/10 border border-red-400/20',
  info: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  neutral: 'text-gray-400 bg-gray-400/10 border border-gray-400/20',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export default function Badge({
  text,
  variant = 'neutral',
  size = 'sm',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {text}
    </span>
  );
}

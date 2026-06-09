/**
 * Format a number with commas and optional decimals.
 */
export function formatNumber(n: number, decimals: number = 0): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a CO2 value in kg with appropriate units.
 */
export function formatCO2(kg: number): string {
  if (kg >= 1000) {
    return `${formatNumber(kg / 1000, 1)} t CO₂`;
  }
  return `${formatNumber(kg, 1)} kg CO₂`;
}

/**
 * Format a number as a percentage string.
 */
export function formatPercentage(n: number): string {
  return `${formatNumber(n, 1)}%`;
}

/**
 * Get a Tailwind text color class based on a sustainability score.
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-emerald-400';
  if (score >= 30) return 'text-amber-400';
  return 'text-red-400';
}

/**
 * Get a Tailwind background color class based on a sustainability score.
 */
export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-400';
  if (score >= 60) return 'bg-emerald-400';
  if (score >= 30) return 'bg-amber-400';
  return 'bg-red-400';
}

/**
 * Get the hex color for a given score.
 */
export function getScoreHexColor(score: number): string {
  if (score >= 80) return '#4ade80';
  if (score >= 60) return '#34d399';
  if (score >= 30) return '#fbbf24';
  return '#f87171';
}

/**
 * Get a label describing the score quality.
 */
export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 30) return 'Needs Improvement';
  return 'Critical';
}

/**
 * Get a Tailwind color class for difficulty levels.
 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'medium':
      return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'hard':
      return 'text-red-400 bg-red-400/10 border-red-400/20';
    default:
      return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
}

/**
 * Get an emoji icon for a category.
 */
export function getCategoryIcon(category: string): string {
  switch (category.toLowerCase()) {
    case 'transport':
    case 'transportation':
      return '🚗';
    case 'energy':
      return '⚡';
    case 'food':
    case 'diet':
      return '🍽️';
    case 'consumption':
      return '🛍️';
    case 'waste':
      return '♻️';
    case 'water':
      return '💧';
    default:
      return '🌍';
  }
}

/**
 * Get a Tailwind color class for a category.
 */
export function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'transport':
    case 'transportation':
      return 'text-blue-400';
    case 'energy':
      return 'text-amber-400';
    case 'food':
    case 'diet':
      return 'text-emerald-400';
    case 'consumption':
      return 'text-violet-400';
    case 'waste':
      return 'text-red-400';
    case 'water':
      return 'text-cyan-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get the hex color for a category (used in charts).
 */
export function getCategoryHexColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'transport':
    case 'transportation':
      return '#3b82f6';
    case 'energy':
      return '#f59e0b';
    case 'food':
    case 'diet':
      return '#10b981';
    case 'consumption':
      return '#8b5cf6';
    case 'waste':
      return '#ef4444';
    case 'water':
      return '#06b6d4';
    default:
      return '#6b7280';
  }
}

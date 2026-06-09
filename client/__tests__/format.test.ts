import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatCO2,
  formatPercentage,
  getScoreColor,
  getScoreBgColor,
  getScoreHexColor,
  getScoreLabel,
  getDifficultyColor,
  getCategoryIcon,
  getCategoryColor,
  getCategoryHexColor,
} from '../src/utils/format';

describe('formatNumber', () => {
  it('should format numbers with commas and default to 0 decimals', () => {
    expect(formatNumber(1234567.89)).toBe('1,234,568');
    expect(formatNumber(1234.56, 1)).toBe('1,234.6');
    expect(formatNumber(0, 2)).toBe('0.00');
  });
});

describe('formatCO2', () => {
  it('should format CO2 in tons if >= 1000 kg', () => {
    expect(formatCO2(1200)).toBe('1.2 t CO₂');
    expect(formatCO2(500)).toBe('500.0 kg CO₂');
    expect(formatCO2(0)).toBe('0.0 kg CO₂');
  });
});

describe('formatPercentage', () => {
  it('should format numbers as percentages', () => {
    expect(formatPercentage(85)).toBe('85.0%');
    expect(formatPercentage(12.34)).toBe('12.3%');
  });
});

describe('getScoreColor', () => {
  it('should return appropriate Tailwind color class for score range', () => {
    expect(getScoreColor(85)).toBe('text-green-400');
    expect(getScoreColor(70)).toBe('text-emerald-400');
    expect(getScoreColor(45)).toBe('text-amber-400');
    expect(getScoreColor(20)).toBe('text-red-400');
  });
});

describe('getScoreBgColor', () => {
  it('should return appropriate Tailwind background color class for score range', () => {
    expect(getScoreBgColor(85)).toBe('bg-green-400');
    expect(getScoreBgColor(70)).toBe('bg-emerald-400');
    expect(getScoreBgColor(45)).toBe('bg-amber-400');
    expect(getScoreBgColor(20)).toBe('bg-red-400');
  });
});

describe('getScoreHexColor', () => {
  it('should return appropriate hex color for score range', () => {
    expect(getScoreHexColor(85)).toBe('#4ade80');
    expect(getScoreHexColor(70)).toBe('#34d399');
    expect(getScoreHexColor(45)).toBe('#fbbf24');
    expect(getScoreHexColor(20)).toBe('#f87171');
  });
});

describe('getScoreLabel', () => {
  it('should return appropriate score quality label', () => {
    expect(getScoreLabel(85)).toBe('Excellent');
    expect(getScoreLabel(70)).toBe('Good');
    expect(getScoreLabel(45)).toBe('Needs Improvement');
    expect(getScoreLabel(20)).toBe('Critical');
  });
});

describe('getDifficultyColor', () => {
  it('should return appropriate class based on difficulty', () => {
    expect(getDifficultyColor('easy')).toContain('text-green-400');
    expect(getDifficultyColor('medium')).toContain('text-amber-400');
    expect(getDifficultyColor('hard')).toContain('text-red-400');
    expect(getDifficultyColor('unknown')).toContain('text-gray-400');
  });
});

describe('getCategoryIcon', () => {
  it('should return correct emoji for categories', () => {
    expect(getCategoryIcon('transport')).toBe('🚗');
    expect(getCategoryIcon('energy')).toBe('⚡');
    expect(getCategoryIcon('food')).toBe('🍽️');
    expect(getCategoryIcon('consumption')).toBe('🛍️');
    expect(getCategoryIcon('waste')).toBe('♻️');
    expect(getCategoryIcon('water')).toBe('💧');
    expect(getCategoryIcon('other')).toBe('🌍');
  });
});

describe('getCategoryColor', () => {
  it('should return correct Tailwind text color for categories', () => {
    expect(getCategoryColor('transport')).toBe('text-blue-400');
    expect(getCategoryColor('energy')).toBe('text-amber-400');
    expect(getCategoryColor('food')).toBe('text-emerald-400');
    expect(getCategoryColor('consumption')).toBe('text-violet-400');
    expect(getCategoryColor('waste')).toBe('text-red-400');
    expect(getCategoryColor('water')).toBe('text-cyan-400');
    expect(getCategoryColor('other')).toBe('text-gray-400');
  });
});

describe('getCategoryHexColor', () => {
  it('should return correct hex color for categories', () => {
    expect(getCategoryHexColor('transport')).toBe('#3b82f6');
    expect(getCategoryHexColor('energy')).toBe('#f59e0b');
    expect(getCategoryHexColor('food')).toBe('#10b981');
    expect(getCategoryHexColor('consumption')).toBe('#8b5cf6');
    expect(getCategoryHexColor('waste')).toBe('#ef4444');
    expect(getCategoryHexColor('water')).toBe('#06b6d4');
    expect(getCategoryHexColor('other')).toBe('#6b7280');
  });
});

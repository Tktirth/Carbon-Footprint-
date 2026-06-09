import React from 'react';
import type { AssessmentFormData } from '../../types';

interface FoodFormProps {
  data: AssessmentFormData;
  onChange: (updates: Partial<AssessmentFormData>) => void;
  errors: Record<string, string>;
}

const dietOptions = [
  {
    value: 'vegan',
    label: 'Vegan',
    icon: '🌱',
    description: 'No animal products at all',
    impact: '~1.5 kg CO₂/day',
    color: 'border-green-500/30 bg-green-500/5',
    activeColor: 'border-green-400 bg-green-500/15 ring-2 ring-green-500/20',
  },
  {
    value: 'vegetarian',
    label: 'Vegetarian',
    icon: '🥗',
    description: 'No meat, may include dairy and eggs',
    impact: '~2.5 kg CO₂/day',
    color: 'border-emerald-500/30 bg-emerald-500/5',
    activeColor: 'border-emerald-400 bg-emerald-500/15 ring-2 ring-emerald-500/20',
  },
  {
    value: 'mixed',
    label: 'Mixed / Balanced',
    icon: '🍽️',
    description: 'Moderate meat consumption with vegetables',
    impact: '~3.5 kg CO₂/day',
    color: 'border-amber-500/30 bg-amber-500/5',
    activeColor: 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-500/20',
  },
  {
    value: 'high_meat',
    label: 'High Meat',
    icon: '🥩',
    description: 'Daily red meat or frequent meat consumption',
    impact: '~5.5 kg CO₂/day',
    color: 'border-red-500/30 bg-red-500/5',
    activeColor: 'border-red-400 bg-red-500/15 ring-2 ring-red-500/20',
  },
];

export default function FoodForm({ data, onChange, errors }: FoodFormProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">🍽️</span>
          Food & Diet
        </h2>
        <p className="text-gray-400 mt-2">
          Your diet is one of the most impactful areas for reducing emissions.
        </p>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-gray-300 mb-4">
          What best describes your diet?
          <span className="text-emerald-400 ml-1" aria-hidden="true">*</span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Diet type selection">
          {dietOptions.map((option) => {
            const isSelected = data.dietType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ dietType: option.value })}
                className={`p-4 rounded-xl border text-left transition-all duration-200
                  ${isSelected ? option.activeColor : `${option.color} hover:border-white/20`}`}
                role="radio"
                aria-checked={isSelected}
                aria-label={`${option.label}: ${option.description}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden="true">{option.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{option.label}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{option.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Est. food emissions: {option.impact}
                    </p>
                  </div>
                  {isSelected && (
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {errors.dietType && (
          <p className="text-sm text-red-400 mt-2" role="alert">{errors.dietType}</p>
        )}
      </fieldset>
    </div>
  );
}

import React from 'react';
import type { AssessmentFormData } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface EnergyFormProps {
  data: AssessmentFormData;
  onChange: (updates: Partial<AssessmentFormData>) => void;
  errors: Record<string, string>;
}

const applianceOptions = [
  { value: 'low', label: '🔋 Low Usage', description: 'Minimal appliance usage, energy-conscious' },
  { value: 'moderate', label: '⚡ Moderate Usage', description: 'Average household appliance usage' },
  { value: 'high', label: '🔌 High Usage', description: 'Heavy appliance usage, multiple devices' },
];

export default function EnergyForm({ data, onChange, errors }: EnergyFormProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">⚡</span>
          Energy Usage
        </h2>
        <p className="text-gray-400 mt-2">
          Tell us about your home energy consumption.
        </p>
      </div>

      <Input
        label="Monthly Electricity Consumption"
        type="number"
        value={data.electricityKwhPerMonth.toString()}
        onChange={(value) => onChange({ electricityKwhPerMonth: Number(value) || 0 })}
        placeholder="e.g., 300"
        helperText="Check your electricity bill — average household uses 250-400 kWh/month"
        error={errors.electricityKwhPerMonth}
        min="0"
        max="10000"
        required
      />

      <Input
        label="Air Conditioning Hours Per Day"
        type="number"
        value={data.acHoursPerDay.toString()}
        onChange={(value) => onChange({ acHoursPerDay: Number(value) || 0 })}
        placeholder="e.g., 6"
        helperText="Average hours AC runs per day (0 if you don't use AC)"
        error={errors.acHoursPerDay}
        min="0"
        max="24"
        required
      />

      <Select
        label="Overall Appliance Usage"
        options={applianceOptions}
        value={data.applianceUsage}
        onChange={(value) => onChange({ applianceUsage: value })}
        error={errors.applianceUsage}
        required
      />

      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm flex items-start gap-3">
        <span className="text-xl" aria-hidden="true">💡</span>
        <div>
          <p className="font-semibold">Energy Saving Tip</p>
          <p className="text-amber-400/70 mt-1">
            Switching to LED bulbs and Energy Star appliances can reduce your home energy use by 20-30%.
          </p>
        </div>
      </div>
    </div>
  );
}

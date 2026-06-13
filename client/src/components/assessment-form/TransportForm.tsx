import type { AssessmentFormData } from '../../types';
import Select from '../ui/Select';
import Input from '../ui/Input';

interface TransportFormProps {
  data: AssessmentFormData;
  onChange: (updates: Partial<AssessmentFormData>) => void;
  errors: Record<string, string>;
}

const vehicleOptions = [
  { value: 'car_petrol', label: '🚗 Petrol Car', description: 'Average 2.3 kg CO₂/L' },
  { value: 'car_diesel', label: '🚙 Diesel Car', description: 'Average 2.7 kg CO₂/L' },
  { value: 'car_electric', label: '⚡ Electric Car', description: 'Low emissions, depends on grid' },
  { value: 'motorcycle', label: '🏍️ Motorcycle', description: 'Lower fuel consumption' },
  { value: 'none', label: '🚶 None / Walk / Cycle', description: 'Zero direct emissions!' },
];

export default function TransportForm({ data, onChange, errors }: TransportFormProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">🚗</span>
          Transportation
        </h2>
        <p className="text-gray-400 mt-2">
          Tell us about your daily commute and travel habits.
        </p>
      </div>

      <Select
        label="Primary Vehicle Type"
        options={vehicleOptions}
        value={data.vehicleType}
        onChange={(value) => onChange({ vehicleType: value })}
        error={errors.vehicleType}
        required
      />

      <Input
        label="Weekly Travel Distance by Personal Vehicle"
        type="number"
        value={data.travelKmPerWeek.toString()}
        onChange={(value) => onChange({ travelKmPerWeek: Number(value) || 0 })}
        placeholder="e.g., 100"
        helperText="How many kilometers do you drive per week?"
        error={errors.travelKmPerWeek}
        min="0"
        max="5000"
        required
      />

      <Input
        label="Weekly Public Transport Distance"
        type="number"
        value={data.publicTransportKmPerWeek.toString()}
        onChange={(value) => onChange({ publicTransportKmPerWeek: Number(value) || 0 })}
        placeholder="e.g., 50"
        helperText="Bus, train, metro — kilometers per week"
        error={errors.publicTransportKmPerWeek}
        min="0"
        max="5000"
        required
      />

      <Input
        label="Flights Per Year"
        type="number"
        value={data.flightsPerYear.toString()}
        onChange={(value) => onChange({ flightsPerYear: Number(value) || 0 })}
        placeholder="e.g., 4"
        helperText="Number of one-way flights (domestic or international)"
        error={errors.flightsPerYear}
        min="0"
        max="200"
        required
      />

      {data.vehicleType === 'none' && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3">
          <span className="text-xl" aria-hidden="true">🌟</span>
          <div>
            <p className="font-semibold">Great choice!</p>
            <p className="text-emerald-400/70 mt-1">
              Not owning a personal vehicle significantly reduces your carbon footprint.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

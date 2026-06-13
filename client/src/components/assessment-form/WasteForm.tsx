import type { AssessmentFormData } from '../../types';
import Input from '../ui/Input';

interface WasteFormProps {
  data: AssessmentFormData;
  onChange: (updates: Partial<AssessmentFormData>) => void;
  errors: Record<string, string>;
}

export default function WasteForm({ data, onChange, errors }: WasteFormProps) {
  const getRecyclingLabel = (pct: number): string => {
    if (pct >= 80) return 'Excellent — you recycle most of your waste!';
    if (pct >= 50) return 'Good — you recycle about half your waste';
    if (pct >= 20) return "Fair — there's room to recycle more";
    return 'Low — consider starting a recycling routine';
  };

  const getRecyclingColor = (pct: number): string => {
    if (pct >= 80) return 'text-green-400';
    if (pct >= 50) return 'text-emerald-400';
    if (pct >= 20) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">♻️</span>
          Waste & Recycling
        </h2>
        <p className="text-gray-400 mt-2">
          How you manage waste directly impacts landfill emissions.
        </p>
      </div>

      <div className="space-y-3">
        <label
          htmlFor="recycling-percentage"
          className="block text-sm font-medium text-gray-300"
        >
          Recycling Percentage
          <span className="text-emerald-400 ml-1" aria-hidden="true">*</span>
        </label>
        <div className="space-y-2">
          <input
            id="recycling-percentage"
            type="range"
            min="0"
            max="100"
            step="5"
            value={data.recyclingPercentage}
            onChange={(e) => onChange({ recyclingPercentage: Number(e.target.value) })}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={data.recyclingPercentage}
            aria-label={`Recycling percentage: ${data.recyclingPercentage}%`}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">0%</span>
            <span className="text-2xl font-bold text-white">
              {data.recyclingPercentage}%
            </span>
            <span className="text-xs text-gray-500">100%</span>
          </div>
          <p className={`text-sm ${getRecyclingColor(data.recyclingPercentage)} text-center`}>
            {getRecyclingLabel(data.recyclingPercentage)}
          </p>
        </div>
        {errors.recyclingPercentage && (
          <p className="text-sm text-red-400" role="alert">{errors.recyclingPercentage}</p>
        )}
      </div>

      <Input
        label="Waste Bags Per Week"
        type="number"
        value={data.wasteBagsPerWeek.toString()}
        onChange={(value) => onChange({ wasteBagsPerWeek: Number(value) || 0 })}
        placeholder="e.g., 3"
        helperText="Number of standard-size garbage bags your household fills per week"
        error={errors.wasteBagsPerWeek}
        min="0"
        max="50"
        required
      />

      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
        <span className="text-xl" aria-hidden="true">🌍</span>
        <div>
          <p className="font-semibold">Why Recycling Matters</p>
          <p className="text-red-400/70 mt-1">
            Each ton of recycled waste prevents 2-3 tons of CO₂ emissions compared to landfill disposal. Composting food waste can further reduce methane emissions.
          </p>
        </div>
      </div>
    </div>
  );
}

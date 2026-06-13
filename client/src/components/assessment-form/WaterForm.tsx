import type { AssessmentFormData } from '../../types';
import Input from '../ui/Input';

interface WaterFormProps {
  data: AssessmentFormData;
  onChange: (updates: Partial<AssessmentFormData>) => void;
  errors: Record<string, string>;
}

export default function WaterForm({ data, onChange, errors }: WaterFormProps) {
  const getUsageLevel = (liters: number): { label: string; color: string } => {
    if (liters <= 80) return { label: 'Low — Great water conservation!', color: 'text-green-400' };
    if (liters <= 120) return { label: 'Below average — Good job!', color: 'text-emerald-400' };
    if (liters <= 150) return { label: 'Average household usage', color: 'text-amber-400' };
    if (liters <= 200) return { label: 'Above average — Consider reducing', color: 'text-orange-400' };
    return { label: 'High usage — Significant reduction possible', color: 'text-red-400' };
  };

  const usage = getUsageLevel(data.waterLitersPerDay);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">💧</span>
          Water Usage
        </h2>
        <p className="text-gray-400 mt-2">
          Water treatment and heating contributes to your carbon footprint.
        </p>
      </div>

      <Input
        label="Daily Water Consumption"
        type="number"
        value={data.waterLitersPerDay.toString()}
        onChange={(value) => onChange({ waterLitersPerDay: Number(value) || 0 })}
        placeholder="e.g., 120"
        helperText="Total liters per day (average is 100-150 liters/day per person)"
        error={errors.waterLitersPerDay}
        min="0"
        max="2000"
        required
      />

      {data.waterLitersPerDay > 0 && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className={`text-sm font-medium ${usage.color}`}>{usage.label}</p>
          <div className="mt-3 w-full bg-white/5 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (data.waterLitersPerDay / 250) * 100)}%` }}
              role="presentation"
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">0L</span>
            <span className="text-xs text-gray-500">250L+</span>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-center">
          <p className="text-2xl" aria-hidden="true">🚿</p>
          <p className="text-xs text-gray-400 mt-1">5-min shower</p>
          <p className="text-sm font-semibold text-cyan-400">~40L</p>
        </div>
        <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-center">
          <p className="text-2xl" aria-hidden="true">🧺</p>
          <p className="text-xs text-gray-400 mt-1">Washing machine</p>
          <p className="text-sm font-semibold text-cyan-400">~50L</p>
        </div>
        <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-center">
          <p className="text-2xl" aria-hidden="true">🍽️</p>
          <p className="text-xs text-gray-400 mt-1">Dishwashing</p>
          <p className="text-sm font-semibold text-cyan-400">~15L</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm flex items-start gap-3">
        <span className="text-xl" aria-hidden="true">💡</span>
        <div>
          <p className="font-semibold">Estimation Guide</p>
          <p className="text-cyan-400/70 mt-1">
            Add up your daily activities: showers (~40L each), toilet flushes (~6L each), cooking/drinking (~5L), laundry (~50L per load), and dishwashing (~15L).
          </p>
        </div>
      </div>
    </div>
  );
}

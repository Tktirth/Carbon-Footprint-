import type { AssessmentFormData } from '../../types';
import Input from '../ui/Input';

interface ConsumptionFormProps {
  data: AssessmentFormData;
  onChange: (updates: Partial<AssessmentFormData>) => void;
  errors: Record<string, string>;
}

export default function ConsumptionForm({ data, onChange, errors }: ConsumptionFormProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">🛍️</span>
          Consumption & Shopping
        </h2>
        <p className="text-gray-400 mt-2">
          Your purchasing habits affect your carbon footprint through manufacturing and shipping.
        </p>
      </div>

      <Input
        label="Online Orders Per Month"
        type="number"
        value={data.onlineOrdersPerMonth.toString()}
        onChange={(value) => onChange({ onlineOrdersPerMonth: Number(value) || 0 })}
        placeholder="e.g., 5"
        helperText="Number of packages delivered to your home each month"
        error={errors.onlineOrdersPerMonth}
        min="0"
        max="200"
        required
      />

      <Input
        label="New Clothing Items Per Month"
        type="number"
        value={data.clothingItemsPerMonth.toString()}
        onChange={(value) => onChange({ clothingItemsPerMonth: Number(value) || 0 })}
        placeholder="e.g., 3"
        helperText="Including shoes, accessories — fast fashion has a significant footprint"
        error={errors.clothingItemsPerMonth}
        min="0"
        max="100"
        required
      />

      <Input
        label="New Electronics Per Year"
        type="number"
        value={data.electronicsPerYear.toString()}
        onChange={(value) => onChange({ electronicsPerYear: Number(value) || 0 })}
        placeholder="e.g., 2"
        helperText="Phones, laptops, tablets, TVs, and other electronics purchased per year"
        error={errors.electronicsPerYear}
        min="0"
        max="50"
        required
      />

      <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm flex items-start gap-3">
        <span className="text-xl" aria-hidden="true">📦</span>
        <div>
          <p className="font-semibold">Did you know?</p>
          <p className="text-violet-400/70 mt-1">
            Manufacturing a single smartphone produces about 70 kg of CO₂. Extending the life of your devices by even one year can significantly reduce your impact.
          </p>
        </div>
      </div>
    </div>
  );
}

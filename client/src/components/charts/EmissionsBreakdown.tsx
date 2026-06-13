import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCO2, getCategoryIcon } from '../../utils/format';

interface EmissionsBreakdownProps {
  transport: number;
  energy: number;
  food: number;
  consumption: number;
  waste: number;
  water: number;
  className?: string;
}

const COLORS: Record<string, string> = {
  Transport: '#3b82f6',
  Energy: '#f59e0b',
  Food: '#10b981',
  Consumption: '#8b5cf6',
  Waste: '#ef4444',
  Water: '#06b6d4',
};

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: {
    name: string;
    value: number;
    fill: string;
    percentage: number;
  };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0];
  return (
    <div className="glass-card p-3 min-w-[160px]">
      <p className="text-sm font-semibold text-white flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full inline-block"
          style={{ backgroundColor: data.payload.fill }}
        />
        {getCategoryIcon(data.name)} {data.name}
      </p>
      <p className="text-sm text-gray-400 mt-1">{formatCO2(data.value)}</p>
      <p className="text-xs text-gray-500">{data.payload.percentage.toFixed(1)}% of total</p>
    </div>
  );
}

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5 text-sm text-gray-400">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </div>
      ))}
    </div>
  );
}

export default function EmissionsBreakdown({
  transport,
  energy,
  food,
  consumption,
  waste,
  water,
  className = '',
}: EmissionsBreakdownProps) {
  const total = transport + energy + food + consumption + waste + water;
  const data = [
    { name: 'Transport', value: transport, percentage: total ? (transport / total) * 100 : 0 },
    { name: 'Energy', value: energy, percentage: total ? (energy / total) * 100 : 0 },
    { name: 'Food', value: food, percentage: total ? (food / total) * 100 : 0 },
    { name: 'Consumption', value: consumption, percentage: total ? (consumption / total) * 100 : 0 },
    { name: 'Waste', value: waste, percentage: total ? (waste / total) * 100 : 0 },
    { name: 'Water', value: water, percentage: total ? (water / total) * 100 : 0 },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 ${className}`}>
        No emissions data available
      </div>
    );
  }

  return (
    <div className={className} role="img" aria-label="Emissions breakdown pie chart">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={3}
            dataKey="value"
            animationBegin={200}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

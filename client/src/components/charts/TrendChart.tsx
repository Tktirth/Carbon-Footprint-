import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TrendPoint } from '../../types';
import { formatNumber } from '../../utils/format';

interface TrendChartProps {
  data: TrendPoint[];
  dataKey?: 'emissions' | 'score';
  color?: string;
  className?: string;
  height?: number;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  dataKey,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  dataKey: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const value = payload[0].value;
  const unit = dataKey === 'emissions' ? ' kg CO₂' : '/100';
  return (
    <div className="glass-card p-3">
      <p className="text-sm font-medium text-gray-400">{label}</p>
      <p className="text-lg font-bold text-white">
        {formatNumber(value, 1)}
        <span className="text-sm font-normal text-gray-400">{unit}</span>
      </p>
    </div>
  );
}

export default function TrendChart({
  data,
  dataKey = 'emissions',
  color = '#10b981',
  className = '',
  height = 300,
}: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center text-gray-500 ${className}`} style={{ height }}>
        No trend data available yet
      </div>
    );
  }

  // Normalize data keys to support both camelCase database schema conversions and TrendPoint interface
  const normalizedData = data.map((d: any) => {
    // Format the date/period nicely
    let rawDate = d.period || d.createdAt || d.date || '';
    let formattedPeriod = '';
    if (rawDate) {
      try {
        const dateObj = new Date(rawDate);
        // If it's a valid date, show short format (e.g., 'Jun 9')
        if (!isNaN(dateObj.getTime())) {
          formattedPeriod = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } else {
          formattedPeriod = rawDate;
        }
      } catch {
        formattedPeriod = rawDate;
      }
    }

    return {
      period: formattedPeriod,
      emissions: d.emissions !== undefined ? d.emissions : (d.annualEmissionsKg !== undefined ? d.annualEmissionsKg : 0),
      score: d.score !== undefined ? d.score : (d.overallScore !== undefined ? d.overallScore : 0),
    };
  });

  const gradientId = `gradient-${dataKey}`;

  return (
    <div className={className} role="img" aria-label={`${dataKey} trend chart`}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={normalizedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="period"
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip dataKey={dataKey} />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

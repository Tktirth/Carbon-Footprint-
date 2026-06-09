import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface CategoryScoresProps {
  transport: number;
  energy: number;
  food: number;
  consumption: number;
  waste: number;
  className?: string;
}

interface TooltipPayloadItem {
  value: number;
  payload: { subject: string; score: number; fullMark: number };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0];
  return (
    <div className="glass-card p-3">
      <p className="text-sm font-medium text-white">{data.payload.subject}</p>
      <p className="text-lg font-bold text-emerald-400">{data.value}/100</p>
    </div>
  );
}

export default function CategoryScores({
  transport,
  energy,
  food,
  consumption,
  waste,
  className = '',
}: CategoryScoresProps) {
  const data = [
    { subject: '🚗 Transport', score: transport, fullMark: 100 },
    { subject: '⚡ Energy', score: energy, fullMark: 100 },
    { subject: '🍽️ Food', score: food, fullMark: 100 },
    { subject: '🛍️ Consumption', score: consumption, fullMark: 100 },
    { subject: '♻️ Waste', score: waste, fullMark: 100 },
  ];

  return (
    <div className={className} role="img" aria-label="Category sustainability scores radar chart">
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid
            stroke="rgba(255,255,255,0.08)"
            gridType="polygon"
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#4b5563', fontSize: 10 }}
            tickCount={5}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#10b981"
            strokeWidth={2}
            fill="#10b981"
            fillOpacity={0.15}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

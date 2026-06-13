import { useEffect, useState } from 'react';
import { getScoreHexColor, getScoreLabel } from '../../utils/format';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export default function ScoreGauge({
  score,
  size = 200,
  label,
  showLabel = true,
  className = '',
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const center = size / 2;
  const color = getScoreHexColor(score);
  const scoreLabel = label || getScoreLabel(score);

  return (
    <div
      className={`flex flex-col items-center ${className}`}
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Sustainability score: ${score} out of 100`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-20 transition-all duration-1000"
          style={{ backgroundColor: color }}
        />
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${color}40)`,
            }}
          />
          {/* Dot at the end of the progress */}
          {animatedScore > 0 && (
            <circle
              cx={
                center +
                radius *
                  Math.cos(
                    ((animatedScore / 100) * 360 - 90) * (Math.PI / 180)
                  )
              }
              cy={
                center +
                radius *
                  Math.sin(
                    ((animatedScore / 100) * 360 - 90) * (Math.PI / 180)
                  )
              }
              r={strokeWidth * 0.6}
              fill={color}
              className="transition-all duration-1000 ease-out"
              style={{
                filter: `drop-shadow(0 0 4px ${color})`,
              }}
            />
          )}
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold text-white transition-all duration-1000"
            style={{ fontSize: size * 0.22 }}
          >
            {Math.round(animatedScore)}
          </span>
          <span
            className="text-gray-400 font-medium"
            style={{ fontSize: size * 0.07 }}
          >
            out of 100
          </span>
        </div>
      </div>
      {showLabel && (
        <div className="mt-3 text-center">
          <span
            className="text-lg font-semibold transition-colors duration-500"
            style={{ color }}
          >
            {scoreLabel}
          </span>
        </div>
      )}
    </div>
  );
}

import React from 'react';

interface SparklineProps {
  color: string;
  glowClass?: string;
  data: number[];
  width?: number;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  color,
  glowClass = '',
  data,
  width = 120,
  height = 36,
}) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className={`overflow-visible ${glowClass}`}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

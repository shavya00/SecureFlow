import React from 'react';

interface GaugeChartProps {
  score: number;
  level: string;
  trend?: string;
  subtitle?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  score = 12,
  level = 'Low Risk',
  trend = '↓ -3%',
  subtitle = 'Your account activity is normal.',
}) => {
  // Semi-circle gauge (radius 75, center 100, 95)
  // Arc angle from 180 to 0 degrees
  const angle = 180 - Math.min(100, Math.max(0, score)) * 1.8;
  const rad = (angle * Math.PI) / 180;
  const needleX = 100 + 65 * Math.cos(rad);
  const needleY = 90 - 65 * Math.sin(rad);

  return (
    <div className="flex flex-col items-center justify-between h-full pt-1">
      {/* Semi-circle Gauge SVG */}
      <div className="relative w-48 h-28 flex items-center justify-center">
        <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="35%" stopColor="#84CC16" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="85%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background track */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#162038"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Color Gradient Track */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            filter="url(#gaugeGlow)"
          />

          {/* Score Indicator Pointer */}
          <circle
            cx={needleX}
            cy={needleY}
            r="6"
            fill="#FFFFFF"
            stroke="#070A13"
            strokeWidth="2.5"
            className="filter drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))"
          />
        </svg>

        {/* Center Text inside the arc */}
        <div className="absolute bottom-2 text-center">
          <div className="text-base font-bold text-white tracking-wide">{level}</div>
          <div className="text-[10px] text-slate-400 max-w-[150px] leading-tight mt-0.5">{subtitle}</div>
        </div>
      </div>

      {/* Bottom Metrics Bar */}
      <div className="w-full flex items-center justify-between pt-4 mt-2 border-t border-[#141C30]">
        <div>
          <div className="text-[10px] text-slate-400 font-mono">Risk Score</div>
          <div className="text-sm font-bold font-mono text-white mt-0.5">
            {score} <span className="text-slate-400 font-normal">/ 100</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-0.5 justify-end">
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
};

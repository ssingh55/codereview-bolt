import React from 'react';

interface ScoreCircleProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
}

export default function ScoreCircle({ score, size = 'medium' }: ScoreCircleProps) {
  const getColor = (score: number) => {
    if (score >= 80) return { stroke: '#10B981', text: 'text-emerald-400' };
    if (score >= 60) return { stroke: '#F59E0B', text: 'text-yellow-400' };
    if (score >= 40) return { stroke: '#EF4444', text: 'text-red-400' };
    return { stroke: '#DC2626', text: 'text-red-500' };
  };

  const getSizes = () => {
    switch (size) {
      case 'small':
        return { 
          container: 'w-16 h-16', 
          svg: 'w-16 h-16', 
          text: 'text-xs font-semibold',
          radius: 24,
          strokeWidth: 3
        };
      case 'large':
        return { 
          container: 'w-32 h-32', 
          svg: 'w-32 h-32', 
          text: 'text-2xl font-bold',
          radius: 58,
          strokeWidth: 4
        };
      default:
        return { 
          container: 'w-24 h-24', 
          svg: 'w-24 h-24', 
          text: 'text-lg font-semibold',
          radius: 42,
          strokeWidth: 3
        };
    }
  };

  const { stroke, text } = getColor(score);
  const { container, svg, text: textClass, radius, strokeWidth } = getSizes();
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative ${container}`}>
      <svg className={svg} viewBox="0 0 120 120">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center ${text} ${textClass}`}>
        {score}
      </div>
    </div>
  );
}
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-stone-200/90 p-4 sm:p-5 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-emerald-600 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span className="truncate">{subtext}</span>
          {trend && (
            <span
              className={`font-semibold tabular-nums shrink-0 ml-2 ${
                trend.isPositive ? 'text-emerald-700' : 'text-stone-600'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;

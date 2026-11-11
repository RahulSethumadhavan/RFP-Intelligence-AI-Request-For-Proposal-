import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
}) => {
  return (
    <div className="bg-[#0e131f] rounded-xl border border-slate-800/90 p-5 shadow-xs hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/30 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
          {label}
        </span>
        <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-emerald-400 group-hover:border-emerald-500/40 group-hover:bg-emerald-950/20 transition-all">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-white tracking-tight font-mono group-hover:text-emerald-300 transition-colors">
          {value}
        </h3>
        <p className="text-xs text-slate-400">{subtext}</p>
      </div>
    </div>
  );
};

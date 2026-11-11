import React from 'react';
import { CheckCircle2, AlertTriangle, MinusCircle, AlertOctagon } from 'lucide-react';
import { FieldStatus } from '../../types';

interface StatusBadgeProps {
  status: FieldStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs = {
    verified: {
      label: 'Verified',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
      classes: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-xs shadow-emerald-950/50',
    },
    needs_review: {
      label: 'Needs Review',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
      classes: 'bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-xs shadow-amber-950/50',
    },
    not_specified: {
      label: 'Not Specified',
      icon: <MinusCircle className="w-3.5 h-3.5 text-slate-500" />,
      classes: 'bg-slate-900/90 text-slate-400 border-slate-800',
    },
    error: {
      label: 'Extraction Error',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />,
      classes: 'bg-rose-950/70 text-rose-300 border-rose-500/40 shadow-xs shadow-rose-950/50',
    },
  };

  const current = configs[status] || configs.not_specified;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide ${current.classes}`}
    >
      {current.icon}
      <span>{current.label}</span>
    </span>
  );
};

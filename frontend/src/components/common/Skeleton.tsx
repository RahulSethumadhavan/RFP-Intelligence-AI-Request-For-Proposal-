import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return <div className={`animate-pulse bg-slate-800/80 rounded-md ${className}`} />;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#0e131f] rounded-xl border border-slate-800 p-6 space-y-4 shadow-sm">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 py-4 px-6 border-b border-slate-800/60 animate-pulse">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-4 w-1/5" />
    </div>
  );
};

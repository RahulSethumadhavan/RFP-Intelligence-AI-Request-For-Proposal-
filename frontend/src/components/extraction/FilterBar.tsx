import React from 'react';
import { Search } from 'lucide-react';
import { FieldStatus } from '../../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedFilter: 'all' | FieldStatus;
  onFilterChange: (f: 'all' | FieldStatus) => void;
  counts: {
    total: number;
    verified: number;
    needs_review: number;
    not_specified: number;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  counts,
}) => {
  const filters: { id: 'all' | FieldStatus; label: string; count: number }[] = [
    { id: 'all', label: 'All Fields', count: counts.total },
    { id: 'verified', label: 'Verified', count: counts.verified },
    { id: 'needs_review', label: 'Needs Review', count: counts.needs_review },
    { id: 'not_specified', label: 'Not Specified', count: counts.not_specified },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0e131f] p-3 rounded-xl border border-slate-800/90 shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter fields by name, extracted value, or document..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
        />
      </div>

      {/* Pill Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        {filters.map((flt) => {
          const isSelected = selectedFilter === flt.id;
          return (
            <button
              key={flt.id}
              onClick={() => onFilterChange(flt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>{flt.label}</span>
              <span
                className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {flt.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

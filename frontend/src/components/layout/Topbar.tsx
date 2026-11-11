import React from 'react';
import { Search, Cpu, ShieldCheck, User } from 'lucide-react';
import { BackendHealth } from '../../types';

interface TopbarProps {
  health: BackendHealth | null;
  isDemoMode: boolean;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  health,
  isDemoMode,
  searchQuery = '',
  onSearchChange,
}) => {
  return (
    <header className="h-16 bg-[#090d15] border-b border-slate-800/90 px-6 flex items-center justify-between shrink-0 z-10 shadow-xs">
      {/* Search Input */}
      <div className="relative w-80 max-w-xs">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search fields, values, sources..."
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all font-sans"
        />
      </div>

      {/* Status & User Profile */}
      <div className="flex items-center gap-4">
        {/* Model Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-900/90 rounded-full border border-slate-800 text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-[11px] text-slate-300">
            {isDemoMode ? 'Mock Offline' : (health?.model || 'openai/gpt-oss-120b')}
          </span>
        </div>

        {/* 20-Field Schema Validation Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 rounded-full border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pydantic v2 Schema Strict</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-emerald-400/15 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-400/30 shadow-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-tight">Procurement Lead</p>
            <p className="text-[10px] text-slate-500">Enterprise AI Ops</p>
          </div>
        </div>
      </div>
    </header>
  );
};

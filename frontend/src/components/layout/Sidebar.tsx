import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Download,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';
import { BackendHealth } from '../../types';

interface SidebarProps {
  health: BackendHealth | null;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  health,
  isDemoMode,
  onToggleDemoMode,
}) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Documents', path: '/documents', icon: <FileText className="w-4 h-4" /> },
    { label: 'Extractions', path: '/extractions', icon: <Layers className="w-4 h-4" /> },
    { label: 'Exports', path: '/exports', icon: <Download className="w-4 h-4" /> },
    { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const isConnected = health && health.status === 'healthy' && !isDemoMode;

  return (
    <aside className="w-64 bg-[#090d15] text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 select-none">
      {/* Product Logo Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/30">
          <Zap className="w-5 h-5 fill-slate-950" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <span>RFP Intelligence</span>
            <span className="text-[10px] bg-emerald-400/20 text-emerald-400 border border-emerald-400/30 px-1 py-0.2 rounded font-mono">
              AI
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Enterprise Document Hub</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Intelligence Workspace
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Demo Mode Toggle & Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-[#06080e] space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-slate-400 font-medium">Pipeline Mode</span>
          <button
            onClick={onToggleDemoMode}
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border transition-all cursor-pointer ${
              isDemoMode
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25 shadow-xs shadow-emerald-500/20'
            }`}
            title="Toggle between Live API and Offline Demo Mode"
          >
            {isDemoMode ? 'DEMO MODE' : 'GROQ LIVE'}
          </button>
        </div>

        {/* System Status */}
        <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-900/80 rounded-lg text-xs border border-slate-800/90">
          {isConnected ? (
            <>
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-sm shadow-emerald-400"></span>
              </span>
              <div className="truncate min-w-0">
                <p className="text-[11px] font-semibold text-emerald-300 truncate">Groq LPU Acceleration</p>
                <p className="text-[10px] font-mono text-slate-400 truncate">{health?.model}</p>
              </div>
            </>
          ) : (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0"></span>
              <div className="truncate min-w-0">
                <p className="text-[11px] font-medium text-slate-200">Demo Fallback Active</p>
                <p className="text-[10px] text-slate-500">Zero-cost simulation</p>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

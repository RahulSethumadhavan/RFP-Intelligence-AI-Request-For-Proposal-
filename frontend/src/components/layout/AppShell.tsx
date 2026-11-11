import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { api } from '../../services/api';
import { BackendHealth } from '../../types';

export const AppShell: React.FC = () => {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(api.getDemoMode());

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const h = await api.getHealth();
        setHealth(h);
        setIsDemoMode(api.getDemoMode());
      } catch (err) {
        console.warn('Initial backend health check failed:', err);
      }
    };
    checkBackend();
  }, []);

  const handleToggleDemoMode = () => {
    const next = !isDemoMode;
    api.setDemoMode(next);
    setIsDemoMode(next);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07090e] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Sidebar */}
      <Sidebar
        health={health}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#07090e]">
        <Topbar
          health={health}
          isDemoMode={isDemoMode}
        />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#07090e]">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ isDemoMode, health }} />
          </div>
        </main>
      </div>
    </div>
  );
};

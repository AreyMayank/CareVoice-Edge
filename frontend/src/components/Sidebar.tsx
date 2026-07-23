import React from 'react';
import { LayoutDashboard, Clock, User, History, BarChart3, Settings as SettingsIcon, AlertTriangle } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeEmergenciesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, activeEmergenciesCount = 0 }) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'reminders', label: 'Reminders', icon: Clock },
    { id: 'patient', label: 'Patient Profile', icon: User },
    { id: 'history', label: 'History & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Edge Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 glass-card border-r border-slate-800 flex flex-col justify-between p-4 min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'gradient-bg-primary text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Emergency Status Badge */}
      <div className={`p-4 rounded-xl border transition-all ${
        activeEmergenciesCount > 0 
          ? 'bg-rose-950/50 border-rose-500/40 text-rose-300 animate-pulse'
          : 'bg-slate-900/60 border-slate-800 text-slate-400'
      }`}>
        <div className="flex items-center space-x-2 mb-1">
          <AlertTriangle className={`w-4 h-4 ${activeEmergenciesCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
          <span className="text-xs font-semibold text-white">Emergency Status</span>
        </div>
        <p className="text-xs text-slate-400">
          {activeEmergenciesCount > 0 
            ? `${activeEmergenciesCount} ACTIVE SOS ALERTS!` 
            : 'All Systems Normal'}
        </p>
      </div>
    </aside>
  );
};

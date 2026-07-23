import React from 'react';
import { Shield, Bell, User as UserIcon, LogOut, Radio, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  isPiConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isPiConnected = false }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 glass-nav px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-tight text-white">CareVoice <span className="gradient-text font-extrabold">Edge</span></h1>
            {isPiConnected ? (
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Pi Connected
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                Pi Disconnected
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            Target: {isPiConnected ? 'Raspberry Pi 5 Subsystem' : 'Simulated Desktop Subsystem'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Hardware Edge Heartbeat Indicator */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
          <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="text-slate-300 font-medium">Engine Active:</span>
          <span className="text-emerald-400 font-semibold">Vosk + pyttsx3</span>
        </div>

        <button 
          id="btn-notifications"
          aria-label="Notifications"
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-slate-800"></div>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-semibold text-xs">
            {user?.full_name?.charAt(0) || 'C'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">{user?.full_name || 'Caretaker'}</p>
            <p className="text-[10px] text-slate-400">{user?.email || 'caretaker@carevoice.local'}</p>
          </div>
          <button
            id="btn-logout"
            onClick={logout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

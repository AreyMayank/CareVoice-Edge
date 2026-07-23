import React, { useState } from 'react';
import { Radio, Mic, Volume2, CheckCircle2, Clock, Cpu, Sparkles } from 'lucide-react';
import { LiveStatus } from '../types';
import { api } from '../api/client';

interface LiveStatusWidgetProps {
  status: LiveStatus | null;
  onRefresh: () => void;
}

export const LiveStatusWidget: React.FC<LiveStatusWidgetProps> = ({ status, onRefresh }) => {
  const [simulatedSpeech, setSimulatedSpeech] = useState<string>('I took my blood pressure medicine');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  const handleSimulateVoiceConfirmation = async () => {
    if (!status?.current_reminder?.id) return;
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const res = await api.confirmVoice(status.current_reminder.id, simulatedSpeech);
      setSimulationResult(`Voice Confirmed: ${res.intent} (${res.status})`);
      onRefresh();
    } catch (err: any) {
      setSimulationResult(`Error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Live Edge Voice Status</h2>
            <p className="text-xs text-slate-400">Offline Speech Engine & Real-time Task Monitor</p>
          </div>
        </div>
        {status?.device_status?.raspberry_connected ? (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Raspberry Pi 5 Active
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            Raspberry Pi 5 Disconnected
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Current Scheduled */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 mb-1">
            <Volume2 className="w-4 h-4" />
            <span>Active Voice Prompt</span>
          </div>
          <p className="text-sm font-bold text-white">{status?.current_reminder?.title || 'No Active Reminders'}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Scheduled: <strong className="text-slate-200">{status?.current_reminder?.scheduled_time}</strong></span>
            <span className="capitalize px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{status?.current_reminder?.category}</span>
          </div>
        </div>

        {/* Last Confirmation */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Last Voice Confirmation</span>
          </div>
          <p className="text-sm font-bold text-white capitalize">{status?.last_confirmation?.status || 'None'}</p>
          <p className="text-xs text-slate-400 mt-1 truncate">"{status?.last_confirmation?.transcript || 'No transcript'}"</p>
        </div>

        {/* Next Scheduled */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 mb-1">
            <Clock className="w-4 h-4" />
            <span>Next Scheduled</span>
          </div>
          <p className="text-sm font-bold text-white">{status?.next_reminder?.title || 'None'}</p>
          <p className="text-xs text-slate-400 mt-1">Time: <strong className="text-slate-200">{status?.next_reminder?.scheduled_time}</strong></p>
        </div>
      </div>

      {/* Interactive Voice Confirmation Simulator */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Mic className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs text-slate-300 font-medium whitespace-nowrap">Simulate Patient Voice Reply:</span>
          <input
            id="input-voice-simulation"
            type="text"
            value={simulatedSpeech}
            onChange={(e) => setSimulatedSpeech(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 w-full md:w-64"
            placeholder="e.g. Done, took medicine"
          />
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          {simulationResult && (
            <span className="text-xs font-medium text-emerald-400 animate-pulse truncate max-w-xs">{simulationResult}</span>
          )}
          <button
            id="btn-simulate-voice"
            onClick={handleSimulateVoiceConfirmation}
            disabled={isSimulating || !status?.current_reminder?.id}
            className="px-4 py-2 text-xs font-bold text-white gradient-bg-primary rounded-xl hover:opacity-90 transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isSimulating ? 'Processing Voice...' : 'Trigger Voice Check'}
          </button>
        </div>
      </div>
    </div>
  );
};

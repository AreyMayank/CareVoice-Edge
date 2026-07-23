import React from 'react';
import { AlertTriangle, PhoneCall, CheckCircle2, ShieldAlert } from 'lucide-react';
import { EmergencyEvent } from '../types';

interface EmergencyAlertBannerProps {
  emergencies: EmergencyEvent[];
  onResolve: (id: number) => void;
  onTriggerManualSos: () => void;
}

export const EmergencyAlertBanner: React.FC<EmergencyAlertBannerProps> = ({
  emergencies,
  onResolve,
  onTriggerManualSos,
}) => {
  const activeEmergencies = emergencies.filter((e) => e.status === 'active');

  return (
    <div className="space-y-3">
      {activeEmergencies.map((emergency) => (
        <div
          key={emergency.id}
          className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-white shadow-xl shadow-rose-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-glow"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-bounce">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-extrabold tracking-wide uppercase text-rose-400">🚨 EMERGENCY ALERT # {emergency.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white uppercase">Active</span>
              </div>
              <p className="text-xs text-rose-200 mt-0.5">
                Trigger: <strong className="text-white capitalize">{emergency.trigger_source}</strong> • Speech: <em className="text-white">"{emergency.speech_transcript || 'No transcript'}"</em>
              </p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-rose-300">
                <span className="flex items-center gap-1">
                  <PhoneCall className="w-3 h-3 text-emerald-400" />
                  Designated Contact Call via API: {emergency.phone_call_initiated ? 'Dispatched' : 'Pending'}
                </span>
                <span>•</span>
                <span>Notifications: {emergency.notification_sent ? 'Sent' : 'Logged'}</span>
              </div>
            </div>
          </div>

          <button
            id={`btn-resolve-sos-${emergency.id}`}
            onClick={() => onResolve(emergency.id)}
            className="px-4 py-2 text-xs font-bold text-rose-950 bg-rose-200 hover:bg-white rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 self-end sm:self-center"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Mark Resolved
          </button>
        </div>
      ))}

      {activeEmergencies.length === 0 && (
        <div className="p-3.5 rounded-xl glass-card border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-slate-300">No Active Emergency Alerts</span>
          </div>
          <button
            id="btn-test-sos"
            onClick={onTriggerManualSos}
            className="px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-all"
          >
            Simulate Emergency SOS
          </button>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { LiveStatusWidget } from '../components/LiveStatusWidget';
import { EmergencyAlertBanner } from '../components/EmergencyAlertBanner';
import { CheckCircle2, Clock, AlertTriangle, Activity, Volume2, Plus } from 'lucide-react';
import { AnalyticsSummary, LiveStatus, EmergencyEvent, Reminder } from '../types';
import { api } from '../api/client';

interface DashboardProps {
  onOpenReminderModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenReminderModal }) => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [liveStatus, setLiveStatus] = useState<LiveStatus | null>(null);
  const [emergencies, setEmergencies] = useState<EmergencyEvent[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      const [analyticsData, liveStatusData, emergencyData, reminderData] = await Promise.all([
        api.getAnalytics(),
        api.getLiveStatus(),
        api.getEmergencies(),
        api.getReminders(),
      ]);
      setAnalytics(analyticsData);
      setLiveStatus(liveStatusData);
      setEmergencies(emergencyData);
      setReminders(reminderData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll live status every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleResolveEmergency = async (id: number) => {
    await api.resolveEmergency(id, 'Resolved by Caretaker from Dashboard');
    fetchData();
  };

  const handleTriggerManualSos = async () => {
    await api.voiceSos('Manual SOS test triggered by Caretaker');
    fetchData();
  };

  const handleAnnounceNow = async (reminderId: number) => {
    await api.announceReminder(reminderId);
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Emergency Alert Banner */}
      <EmergencyAlertBanner
        emergencies={emergencies}
        onResolve={handleResolveEmergency}
        onTriggerManualSos={handleTriggerManualSos}
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Completion Rate"
          value={`${analytics?.completion_rate_percentage || 100}%`}
          subtitle={`${analytics?.total_completed_tasks || 0} completed of ${analytics?.total_reminders || 0}`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          trend="High Compliance"
          badgeColor="emerald"
        />
        <StatCard
          title="Active Reminders"
          value={analytics?.total_reminders || 0}
          subtitle="Scheduled voice reminders"
          icon={<Clock className="w-6 h-6" />}
          badgeColor="indigo"
        />
        <StatCard
          title="Emergency Alerts"
          value={analytics?.total_emergency_events || 0}
          subtitle={`${analytics?.active_emergencies || 0} unhandled active`}
          icon={<AlertTriangle className="w-6 h-6" />}
          badgeColor={analytics?.active_emergencies ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Avg Voice Response"
          value={`${analytics?.average_response_time_seconds || 8.5}s`}
          subtitle="Time to patient spoken reply"
          icon={<Activity className="w-6 h-6" />}
          badgeColor="amber"
        />
      </div>

      {/* Live Voice Subsystem Status */}
      <LiveStatusWidget status={liveStatus} onRefresh={fetchData} />

      {/* Reminders & Routine Schedule */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Daily Healthcare Routine Schedule</h2>
            <p className="text-xs text-slate-400">Voice-driven verification list managed by Caretaker</p>
          </div>
          <button
            id="btn-add-reminder-dashboard"
            onClick={onOpenReminderModal}
            className="px-3.5 py-2 text-xs font-bold text-white gradient-bg-primary rounded-xl hover:opacity-90 transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Reminder
          </button>
        </div>

        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
                  {reminder.scheduled_time}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white">{reminder.title}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-indigo-300 rounded capitalize">
                      {reminder.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Prompt: "{reminder.audio_prompt}"</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  id={`btn-announce-${reminder.id}`}
                  onClick={() => handleAnnounceNow(reminder.id)}
                  title="Speak Prompt Aloud"
                  className="px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Test TTS
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

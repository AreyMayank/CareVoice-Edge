import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Volume2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Reminder } from '../types';
import { api } from '../api/client';

interface RemindersProps {
  onOpenModal: (reminder?: Reminder) => void;
}

export const Reminders: React.FC<RemindersProps> = ({ onOpenModal }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadReminders = async () => {
    try {
      const data = await api.getReminders();
      setReminders(data);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this voice reminder?')) {
      await api.deleteReminder(id);
      loadReminders();
    }
  };

  const handleToggleActive = async (reminder: Reminder) => {
    await api.updateReminder(reminder.id, { is_active: !reminder.is_active });
    loadReminders();
  };

  const handleTestTts = async (id: number) => {
    await api.announceReminder(id);
    alert('Voice Engine TTS prompt played aloud successfully!');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Patient Voice Reminders</h1>
          <p className="text-xs text-slate-400">Schedule daily routine prompts and voice confirmation rules</p>
        </div>
        <button
          id="btn-create-new-reminder"
          onClick={() => onOpenModal()}
          className="px-4 py-2 text-xs font-bold text-white gradient-bg-primary rounded-xl hover:opacity-90 transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Create New Reminder
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className={`glass-card p-5 rounded-2xl border transition-all ${
              reminder.is_active ? 'border-slate-800 hover:border-indigo-500/40' : 'border-slate-800/40 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl gradient-bg-primary flex flex-col items-center justify-center text-white font-extrabold text-sm shadow-md">
                  <span>{reminder.scheduled_time}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{reminder.title}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded capitalize">
                      {reminder.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Repeat: <strong className="text-slate-300 capitalize">{reminder.repeat_days}</strong> • Max Retries: {reminder.max_retries}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  id={`btn-edit-reminder-${reminder.id}`}
                  onClick={() => onOpenModal(reminder)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  id={`btn-delete-reminder-${reminder.id}`}
                  onClick={() => handleDelete(reminder.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-indigo-400 block mb-1">TTS Voice Prompt:</span>
              "{reminder.audio_prompt}"
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                id={`btn-toggle-active-${reminder.id}`}
                onClick={() => handleToggleActive(reminder)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  reminder.is_active
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {reminder.is_active ? 'Active' : 'Disabled'}
              </button>

              <button
                id={`btn-test-tts-${reminder.id}`}
                onClick={() => handleTestTts(reminder.id)}
                className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-all flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                Speak Aloud
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

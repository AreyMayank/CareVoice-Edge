import React, { useState, useEffect } from 'react';
import { X, Clock, Volume2, Save } from 'lucide-react';
import { Reminder } from '../types';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Reminder>) => Promise<void>;
  reminder?: Reminder | null;
  patientId: number;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  reminder,
  patientId,
}) => {
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<'medicine' | 'exercise' | 'hydration' | 'vitals' | 'general'>('medicine');
  const [scheduledTime, setScheduledTime] = useState<string>('09:00');
  const [repeatDays, setRepeatDays] = useState<string>('daily');
  const [audioPrompt, setAudioPrompt] = useState<string>('');
  const [maxRetries, setMaxRetries] = useState<number>(3);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (reminder) {
      setTitle(reminder.title);
      setCategory(reminder.category);
      setScheduledTime(reminder.scheduled_time);
      setRepeatDays(reminder.repeat_days);
      setAudioPrompt(reminder.audio_prompt);
      setMaxRetries(reminder.max_retries);
    } else {
      setTitle('');
      setCategory('medicine');
      setScheduledTime('09:00');
      setRepeatDays('daily');
      setAudioPrompt('Please take your scheduled medication with water.');
      setMaxRetries(3);
    }
  }, [reminder, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        patient_id: patientId,
        title,
        category,
        scheduled_time: scheduledTime,
        repeat_days: repeatDays,
        audio_prompt: audioPrompt,
        max_retries: Number(maxRetries),
        is_active: true,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {reminder ? 'Edit Voice Reminder' : 'Create New Voice Reminder'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Reminder Title</label>
            <input
              id="input-reminder-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Take Blood Pressure Medicine"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Category</label>
              <select
                id="select-reminder-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="medicine">Medicine</option>
                <option value="exercise">Exercise</option>
                <option value="hydration">Hydration</option>
                <option value="vitals">Vitals Check</option>
                <option value="general">General Routine</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Scheduled Time (24h)</label>
              <input
                id="input-reminder-time"
                type="time"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Repeat Frequency</label>
              <select
                id="select-reminder-repeat"
                value={repeatDays}
                onChange={(e) => setRepeatDays(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays Only</option>
                <option value="weekends">Weekends Only</option>
                <option value="once">One-time</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Max Audio Retries</label>
              <input
                id="input-reminder-retries"
                type="number"
                min={1}
                max={5}
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              Spoken Audio Text (TTS Prompt)
            </label>
            <textarea
              id="textarea-audio-prompt"
              required
              rows={3}
              value={audioPrompt}
              onChange={(e) => setAudioPrompt(e.target.value)}
              placeholder="Text spoken aloud by CareBot when reminder triggers..."
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-reminder"
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white gradient-bg-primary rounded-xl hover:opacity-90 transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

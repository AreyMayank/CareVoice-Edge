import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { History, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { AnalyticsSummary, Reminder } from '../types';
import { api } from '../api/client';

export const TaskHistory: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [a, r] = await Promise.all([api.getAnalytics(), api.getReminders()]);
        setAnalytics(a);
        setReminders(r);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const chartData = analytics?.category_breakdown.map((item) => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    Completed: item.completed,
    Missed: item.missed,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Task Completion History & Analytics</h1>
        <p className="text-xs text-slate-400">Voice confirmation statistics, compliance breakdown, and patient response metrics</p>
      </div>

      {/* Analytics Chart */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Routine Category Compliance Breakdown
          </h2>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            {analytics?.completion_rate_percentage}% Overall Adherence Rate
          </span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
              />
              <Bar dataKey="Completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Missed" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Logged Completion Table */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <h2 className="text-base font-bold text-white mb-4">Recent Spoken Confirmations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Reminder Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Spoken Transcript</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {reminders.flatMap((r) =>
                (r.recent_completions || []).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 text-slate-300">{new Date(c.created_at).toLocaleTimeString()}</td>
                    <td className="py-3 px-4 font-semibold text-white">{r.title}</td>
                    <td className="py-3 px-4 capitalize text-indigo-400">{r.category}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 italic">"{c.patient_speech_transcript || 'N/A'}"</td>
                  </tr>
                ))
              )}
              {reminders.every((r) => !r.recent_completions || r.recent_completions.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 italic">
                    No task completions recorded yet. Click "Trigger Voice Check" on the Overview tab to simulate spoken response!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

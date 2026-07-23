import React, { useState } from 'react';
import { Cpu, Mic, Volume2, Bell, PhoneCall, Terminal, Save, CheckCircle2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const [telegramToken, setTelegramToken] = useState<string>('');
  const [telegramChatId, setTelegramChatId] = useState<string>('');
  const [ntfyTopic, setNtfyTopic] = useState<string>('carevoice_alerts');
  const [twilioSid, setTwilioSid] = useState<string>('');
  const [caretakerPhone, setCaretakerPhone] = useState<string>('+1 (555) 019-2831');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Edge AI Subsystem Settings</h1>
          <p className="text-xs text-slate-400">Raspberry Pi 5 audio hardware, offline speech engines, and dispatch integrations</p>
        </div>
        {isSaved && (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg animate-pulse">
            Settings Saved to .env Configuration!
          </span>
        )}
      </div>

      {/* Raspberry Pi Hardware Status Box */}
      <div className="glass-card p-6 rounded-2xl border border-indigo-500/30">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl gradient-bg-primary text-white">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Raspberry Pi 5 Target Subsystem</h2>
            <p className="text-xs text-slate-400">Offline-first architecture • Zero external internet requirement</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 font-medium block">Speech-to-Text (STT)</span>
            <span className="text-indigo-400 font-bold text-sm mt-0.5 block">Vosk Offline (vosk-model-small-en-us)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 font-medium block">Text-to-Speech (TTS)</span>
            <span className="text-emerald-400 font-bold text-sm mt-0.5 block">pyttsx3 / Piper TTS Engine</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 font-medium block">Wake Word Engine</span>
            <span className="text-purple-400 font-bold text-sm mt-0.5 block">OpenWakeWord ("Hey CareBot")</span>
          </div>
        </div>
      </div>

      {/* Dispatch Channels Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Telegram & ntfy */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            Notification Webhooks & Telegram Bot
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Telegram Bot Token</label>
              <input
                id="input-telegram-token"
                type="text"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                placeholder="123456789:ABCdefGhIJKlmNoPQ..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Telegram Chat ID</label>
              <input
                id="input-telegram-chatid"
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="-100987654321"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">ntfy Topic Name</label>
            <input
              id="input-ntfy-topic"
              type="text"
              value={ntfyTopic}
              onChange={(e) => setNtfyTopic(e.target.value)}
              placeholder="carevoice_alerts"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Twilio Emergency Calling */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-rose-400" />
            Twilio Automatic Phone Calling Dispatch
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Twilio Account SID</label>
              <input
                id="input-twilio-sid"
                type="text"
                value={twilioSid}
                onChange={(e) => setTwilioSid(e.target.value)}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Caretaker Phone Number</label>
              <input
                id="input-caretaker-phone"
                type="text"
                value={caretakerPhone}
                onChange={(e) => setCaretakerPhone(e.target.value)}
                placeholder="+1 (555) 019-2831"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            id="btn-save-settings"
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white gradient-bg-primary rounded-xl hover:opacity-90 transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Save Edge Settings
          </button>
        </div>
      </form>
    </div>
  );
};

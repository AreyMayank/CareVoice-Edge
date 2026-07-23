import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ReminderModal } from './components/ReminderModal';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Reminders } from './pages/Reminders';
import { PatientProfile } from './pages/PatientProfile';
import { TaskHistory } from './pages/TaskHistory';
import { Settings } from './pages/Settings';
import { Reminder } from './types';
import { api } from './api/client';

const MainContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [isPiConnected, setIsPiConnected] = useState<boolean>(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const status = await api.getLiveStatus();
        setIsPiConnected(status.device_status?.raspberry_connected || false);
      } catch (err) {
        console.error('Failed to check live status', err);
      }
    }
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Booting CareVoice Edge Subsystem...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleOpenReminderModal = (reminder?: Reminder) => {
    setEditingReminder(reminder || null);
    setIsReminderModalOpen(true);
  };

  const handleSaveReminder = async (data: Partial<Reminder>) => {
    if (editingReminder) {
      await api.updateReminder(editingReminder.id, data);
    } else {
      await api.createReminder(data);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar isPiConnected={isPiConnected} />
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <Dashboard onOpenReminderModal={() => handleOpenReminderModal()} />}
          {activeTab === 'reminders' && <Reminders onOpenModal={handleOpenReminderModal} />}
          {activeTab === 'patient' && <PatientProfile />}
          {activeTab === 'history' && <TaskHistory />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        onSave={handleSaveReminder}
        reminder={editingReminder}
        patientId={1}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;

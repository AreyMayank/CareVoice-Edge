import { Patient, Reminder, EmergencyEvent, AnalyticsSummary, LiveStatus, User } from '../types';

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://localhost:8000/api/v1'
  : '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('carevoice_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network request failed' }));
    throw new Error(errorData.detail || 'API request failed');
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (username: string, password: string): Promise<{ access_token: string; user: User }> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }

    return response.json();
  },

  getCurrentUser: (): Promise<User> => request('/auth/me'),

  // Patients
  getPatients: (): Promise<Patient[]> => request('/patients'),
  createPatient: (data: Partial<Patient>): Promise<Patient> => request('/patients', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id: number, data: Partial<Patient>): Promise<Patient> => request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Reminders
  getReminders: (patientId?: number): Promise<Reminder[]> => request(patientId ? `/reminders?patient_id=${patientId}` : '/reminders'),
  createReminder: (data: Partial<Reminder>): Promise<Reminder> => request('/reminders', { method: 'POST', body: JSON.stringify(data) }),
  updateReminder: (id: number, data: Partial<Reminder>): Promise<Reminder> => request(`/reminders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteReminder: (id: number): Promise<{ message: string }> => request(`/reminders/${id}`, { method: 'DELETE' }),
  announceReminder: (id: number): Promise<any> => request(`/reminders/${id}/announce`, { method: 'POST' }),
  confirmVoice: (reminder_id: number, patient_speech: string): Promise<any> => 
    request('/reminders/confirm-voice', { method: 'POST', body: JSON.stringify({ reminder_id, patient_speech }) }),

  // Emergency
  getEmergencies: (): Promise<EmergencyEvent[]> => request('/emergency'),
  triggerEmergency: (data: { patient_id?: number; trigger_source: string; speech_transcript?: string }): Promise<EmergencyEvent> => 
    request('/emergency/trigger', { method: 'POST', body: JSON.stringify(data) }),
  resolveEmergency: (id: number, notes?: string): Promise<EmergencyEvent> => 
    request(`/emergency/${id}/resolve`, { method: 'PUT', body: JSON.stringify({ notes }) }),
  voiceSos: (transcript: string): Promise<any> => request(`/emergency/voice-sos?speech_transcript=${encodeURIComponent(transcript)}`, { method: 'POST' }),

  // Analytics & Live Status
  getAnalytics: (): Promise<AnalyticsSummary> => request('/analytics'),
  getLiveStatus: (): Promise<LiveStatus> => request('/live-status'),
};

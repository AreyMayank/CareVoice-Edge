export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface Patient {
  id: number;
  full_name: string;
  age: number;
  room_number?: string;
  medical_conditions?: string;
  emergency_contact?: string;
  notes?: string;
  caretaker_id?: number;
  created_at: string;
  updated_at: string;
}

export interface TaskCompletion {
  id: number;
  reminder_id: number;
  status: 'completed' | 'missed' | 'retry_pending';
  completed_at?: string;
  patient_speech_transcript?: string;
  response_time_seconds?: number;
  attempt_count: number;
  notes?: string;
  created_at: string;
}

export interface Reminder {
  id: number;
  patient_id: number;
  title: string;
  category: 'medicine' | 'exercise' | 'hydration' | 'vitals' | 'general';
  scheduled_time: string;
  repeat_days: string;
  is_active: boolean;
  audio_prompt: string;
  max_retries: number;
  retry_interval_minutes: number;
  recent_completions?: TaskCompletion[];
  created_at: string;
  updated_at: string;
}

export interface EmergencyEvent {
  id: number;
  patient_id?: number;
  trigger_source: string;
  status: 'active' | 'resolved' | 'acknowledged';
  speech_transcript?: string;
  notification_sent: boolean;
  phone_call_initiated: boolean;
  resolved_at?: string;
  notes?: string;
  created_at: string;
}

export interface CategoryStats {
  category: string;
  total: number;
  completed: number;
  missed: number;
}

export interface AnalyticsSummary {
  total_reminders: number;
  completion_rate_percentage: number;
  total_completed_tasks: number;
  total_missed_tasks: number;
  total_emergency_events: number;
  active_emergencies: number;
  average_response_time_seconds: number;
  category_breakdown: CategoryStats[];
}

export interface LiveStatus {
  current_reminder: {
    id?: number;
    title: string;
    category: string;
    scheduled_time: string;
  };
  last_confirmation: {
    id?: number;
    status: string;
    timestamp?: string;
    transcript?: string;
  };
  next_reminder: {
    id?: number;
    title: string;
    scheduled_time: string;
  };
  device_status: {
    offline_mode: boolean;
    target: string;
    speech_engine: string;
    system_status: string;
    wakeword_active: boolean;
    raspberry_connected: boolean;
  };
}

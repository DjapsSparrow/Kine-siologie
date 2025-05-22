export interface Protocol {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  file_url: string | null;
  is_favorite: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface ProtocolCategory {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  global_summary: string | null;
  personal_notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  appointments?: Appointment[];
  sessions?: Session[];
  documents?: Document[];
}

export interface Session {
  id: string;
  client_id: string | null;
  appointment_id: string | null;
  protocol_id: string | null;
  client_feedback: string | null;
  practitioner_observations: string | null;
  practitioner_notes: string | null;
  synthetic_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  client_id: string | null;
  date: string;
  start_time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  client?: Client;
}

export interface Document {
  id: string;
  name: string;
  category: string | null;
  file_url: string;
  file_type: string | null;
  tags: string[] | null;
  client_id: string | null;
  protocol_id: string | null;
  session_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  dateCreated: Date;
  dateModified: Date;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  autoLock: boolean;
  autoLockTimeout: number; // in minutes
  showWellnessReminder: boolean;
}
// Types untuk Chat Session Management

export interface Patient {
  id: string;
  whatsapp_number: string;
  full_name: string | null;
  created_at: string;
  last_session_id: string | null;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: 'USER' | 'BOT';
  message_content: string | null;
  timestamp: string;
  context_step: string | null;
}

export interface ChatSession {
  id: string;
  patient_id: string;
  start_time: string;
  end_time: string | null;
  status: string;
  final_step_reached: string | null;
  total_messages: number;
  patient?: Patient;
}

export interface ChatSessionMetrics {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  todaySessions: number;
  avgMessagesPerSession: number;
}

export interface ChatSessionFilterState {
  searchTerm: string;
  debouncedSearchTerm: string;
  statusFilter: string;
  startDate: string;
  endDate: string;
}

export interface RawChatSessionData {
  id: string;
  patient_id: string;
  start_time: string;
  end_time: string | null;
  status: string;
  final_step_reached: string | null;
  total_messages: number;
  ms_patients?: Patient;
}
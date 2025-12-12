// Types untuk Chat Conversations Management (Updated)

export interface ChatSession {
  id: string;
  client_id: string;
  source: 'landing_page' | 'whatsapp';
  sender_id: string;
  contact_id: string | null;
  start_time: string;
  end_time: string | null;
  status: string;
  total_messages: number;
  created_at: string;
}

export interface LPChatMessage {
  id: string;
  client_id: string;
  session_id: string;
  role: 'agent' | 'user';
  message: string;
  created_at: string;
  feedback?: 'like' | 'dislike' | null;
  feedback_text?: string | null;
}

export interface WAChatMessage {
  id: string;
  client_id: string;
  session_id: string;
  sender_type: 'USER' | 'BOT';
  message_content: string;
  timestamp: string;
  context_step: string;
}

// Unified Message type untuk display
export interface UnifiedMessage {
  id: string;
  session_id: string;
  role: 'agent' | 'user';
  message: string;
  created_at: string;
  feedback?: 'like' | 'dislike' | null;
  feedback_text?: string | null;
  source: 'landing_page' | 'whatsapp';
}

// Conversation summary per session
export interface ChatConversation {
  session_id: string;
  sender_id: string;
  source: 'landing_page' | 'whatsapp';
  total_messages: number;
  last_message: string;
  last_message_time: string;
  first_message_time: string;
  agent_messages: number;
  user_messages: number;
  messages_with_feedback: number;
  status: string;
  contact_id: string | null;
}

export interface ChatConversationMetrics {
  totalSessions: number;
  totalMessages: number;
  todaySessions: number;
  sessionsWithFeedback: number;
  avgMessagesPerSession: number;
  landingPageSessions: number;
  whatsappSessions: number;
}

export interface ChatConversationFilterState {
  searchTerm: string;
  debouncedSearchTerm: string;
  feedbackFilter: string;
  sourceFilter: string; // 'all', 'landing_page', 'whatsapp'
  startDate: string;
  endDate: string;
}
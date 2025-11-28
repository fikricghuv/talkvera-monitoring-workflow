// Types untuk Chat Conversations Management

export interface ChatMessage {
  id: string;
  sender_id: string;
  role: 'agent' | 'user';
  message: string;
  created_at: string;
  feedback?: 'like' | 'dislike' | null;
  feedback_text?: string | null;
}

// Conversation summary per sender_id
export interface ChatConversation {
  sender_id: string;
  total_messages: number;
  last_message: string;
  last_message_time: string;
  first_message_time: string;
  agent_messages: number;
  user_messages: number;
  messages_with_feedback: number;
}

export interface ChatConversationMetrics {
  totalConversations: number;
  totalMessages: number;
  todayConversations: number;
  conversationsWithFeedback: number;
  avgMessagesPerConversation: number;
}

export interface ChatConversationFilterState {
  searchTerm: string;
  debouncedSearchTerm: string;
  feedbackFilter: string;
  startDate: string;
  endDate: string;
}
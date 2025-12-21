// types/consultationRequests.ts

export interface ConsultationRequest {
  id: string;
  contact_id?: string;
  client_id?: string;
  
  // Consultation Details
  company_size: '1-10' | '11-50' | '51-200' | '201+';
  website: string | null;
  describe_consultation: string | null;
  
  // Email Campaign Tracking
  greetings_email_content: string | null;
  greetings_email_sent_at: string | null;
  
  // Status Management
  consultation_status: 
    | 'new'
    | 'greetings_sent'
    | 'follow_up_1_sent'
    | 'follow_up_2_sent'
    | 'follow_up_3_sent'
    | 'replied'
    | 'qualified'
    | 'closed_won'
    | 'closed_lost';
  
  // Timestamps
  submitted_at: string;
  last_follow_up_at: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Relational data (joined)
  contact?: {
    full_name: string;
    email: string;
    phone: string | null;
    company: string | null;
  };
}

export interface ConsultationMetrics {
  totalRequests: number;
  newRequests: number;
  greetingsSent: number;
  inFollowUp: number;
  replied: number;
  qualified: number;
  closedWon: number;
  closedLost: number;
  todayRequests: number;
}

export interface ConsultationFilterState {
  searchTerm: string;
  debouncedSearchTerm: string;
  statusFilter: string;
  companySizeFilter: string;
}

export interface EmailGreeting {
  id: string;
  consultation_id: string;
  contact_id?: string;
  client_id?: string;
  execution_id: string | null;
  workflow_id: string | null;
  
  recipient_email: string;
  recipient_name: string | null;
  email_subject: string | null;
  email_body: string | null;
  html_email_body: string | null;
  
  status: 'generated' | 'sent' | 'failed' | 'bounced';
  error_message: string | null;
  generated_at: string;
  sent_at: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface EmailFollowUp {
  id: string;
  consultation_id: string;
  contact_id?: string;
  client_id?: string;
  execution_id: string | null;
  workflow_id: string | null;
  
  follow_up_stage: 'follow_up_1' | 'follow_up_2' | 'follow_up_3';
  days_after_initial: number | null;
  recipient_email: string;
  email_subject: string | null;
  email_body: string | null;
  
  status: 'scheduled' | 'sent' | 'failed' | 'skipped';
  skip_reason: string | null;
  error_message: string | null;
  
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailReplyDetection {
  id: string;
  consultation_id: string;
  contact_id?: string;
  client_id?: string;
  execution_id: string | null;
  
  sender_email: string;
  message_id: string | null;
  thread_id: string | null;
  subject: string | null;
  received_at: string | null;
  
  is_valid_reply: boolean;
  reply_type: 'interested' | 'not_interested' | 'question' | 'out_of_office' | 'other' | null;
  
  status_updated_from: string | null;
  status_updated_to: string | null;
  action_taken: string | null;
  
  created_at: string;
  updated_at: string;
}
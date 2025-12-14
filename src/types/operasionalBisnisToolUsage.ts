// src/types/operasionalBisnisToolUsage.ts

// ==================== CRM & CHAT DATA TYPES ====================

export interface CRMContact {
  id: string;
  client_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  birthdate: string | null;
  company: string | null;
  job_title: string | null;
  lifecycle_stage: 'lead' | 'qualified' | 'customer' | 'inactive';
  lead_status: 'new' | 'in_progress' | 'follow_up' | 'closed_won' | 'closed_lost';
  lead_score: number;
  tags: string[];
  assigned_to: string | null;
  first_source: 'landing_page' | 'whatsapp' | 'manual';
  first_session_sender_id: string | null;
  first_session_source: 'landing_page' | 'whatsapp' | null;
  first_seen_at: string;
  last_interaction_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  client_id: string;
  source: 'landing_page' | 'whatsapp';
  sender_id: string;
  contact_id: string | null;
  start_time: string;
  end_time: string | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
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
  feedback: 'like' | 'dislike' | null;
  feedback_text: string | null;
}

export interface WAChatMessage {
  id: string;
  client_id: string;
  session_id: string;
  sender_type: 'USER' | 'BOT';
  message_content: string | null;
  timestamp: string;
  context_step: string | null;
}

export interface CRMAppointment {
  id: string;
  client_id: string;
  contact_id: string;
  appointment_start: string;
  appointment_end: string | null;
  reason: string | null;
  source: 'landing_page' | 'whatsapp' | 'manual';
  booked_via_session_id: string | null;
  google_event_id: string | null;
  status: 'scheduled' | 'canceled' | 'rescheduled' | 'completed';
  created_at: string;
  updated_at: string;
}

// ==================== OVERVIEW KPI & METRICS ====================

export interface OperasionalBisnisOverviewKPI {
  // Contact Metrics
  totalContacts: number;
  newContacts: number;
  leadsCount: number;
  qualifiedLeadsCount: number;
  customersCount: number;
  inactiveCount: number;
  
  // Session Metrics
  totalSessions: number;
  landingPageSessions: number;
  whatsappSessions: number;
  completedSessions: number;
  inProgressSessions: number;
  avgMessagesPerSession: number;
  
  // Appointment Metrics
  totalAppointments: number;
  scheduledAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  
  // Source Conversion Metrics
  lpToContactRate: number;
  waToContactRate: number;
  contactToAppointmentRate: number;
}

export interface OperasionalBisnisTimeSeriesData {
  date: string;
  contacts: number;
  sessions: number;
  appointments: number;
  lpSessions: number;
  waSessions: number;
}

// ==================== DISTRIBUTION DATA ====================

export interface ContactSourceDistribution {
  source: string;
  count: number;
  percentage: number;
}

export interface ContactLifecycleDistribution {
  lifecycle_stage: string;
  count: number;
  percentage: number;
}

export interface LeadStatusDistribution {
  lead_status: string;
  count: number;
  percentage: number;
}

export interface SessionStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface AppointmentStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

// ==================== TOP LISTS ====================

export interface TopContact {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  lifecycle_stage: string;
  lead_score: number;
  total_sessions: number;
  total_appointments: number;
  last_interaction_at: string;
}

export interface SessionWithContact {
  id: string;
  source: string;
  sender_id: string;
  start_time: string;
  end_time: string | null;
  status: string;
  total_messages: number;
  duration_minutes: number | null;
  contact_name: string | null;
  contact_email: string | null;
}

export interface AppointmentWithContact {
  id: string;
  appointment_start: string;
  appointment_end: string | null;
  reason: string | null;
  source: string;
  status: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

// ==================== FILTERS ====================

export interface OperasionalBisnisOverviewFilters {
  startDate: string;
  endDate: string;
  sourceFilter?: 'all' | 'landing_page' | 'whatsapp' | 'manual';
  lifecycleFilter?: string;
  leadStatusFilter?: string;
  assignedToFilter?: string;
}

// ==================== MESSAGE ANALYSIS ====================

export interface MessageStats {
  totalMessages: number;
  userMessages: number;
  agentMessages: number;
  avgResponseTime: number; // minutes
  feedbackStats: {
    likes: number;
    dislikes: number;
    feedbackRate: number;
  };
}

export interface ConversionFunnel {
  source: string;
  totalSessions: number;
  contactsCreated: number;
  appointmentsBooked: number;
  sessionToContactRate: number;
  contactToAppointmentRate: number;
}
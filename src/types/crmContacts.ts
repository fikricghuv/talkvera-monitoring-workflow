// types/crmContacts.ts

export interface CRMContact {
  id: string;
  client_id?: string;
  
  // Identitas dasar
  full_name: string;
  email: string;
  phone: string | null;

  // Informasi tambahan
  gender: 'male' | 'female' | 'other' | null;
  birthdate: string | null;
  company: string | null;
  job_title: string | null;

  // Informasi alamat
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;

  // CRM-specific fields
  lifecycle_stage: 'lead' | 'qualified' | 'customer' | 'inactive';
  lead_status: 'new' | 'in_progress' | 'follow_up' | 'closed_won' | 'closed_lost';
  lead_score: number;
  tags: string[];
  assigned_to?: string;

  // First source & tracking
  first_source: 'landing_page' | 'whatsapp' | 'manual';
  first_session_sender_id: string | null;
  first_session_source: 'landing_page' | 'whatsapp' | null;
  first_seen_at: string;
  last_interaction_at: string;

  notes: string | null;

  created_at: string;
  updated_at: string;
}

export interface CRMMetrics {
  totalContacts: number;
  leadContacts: number;
  qualifiedContacts: number;
  customerContacts: number;
  todayContacts: number;
}

export interface CRMFilterState {
  searchTerm: string;
  debouncedSearchTerm: string;
  lifecycleFilter: string;
  leadStatusFilter: string;
}

export interface CRMFormData {
  full_name: string;
  email: string;
  phone: string;
  gender?: 'male' | 'female' | 'other';
  company: string;
  job_title: string;
  city?: string;
  country?: string;
  lifecycle_stage: 'lead' | 'qualified' | 'customer' | 'inactive';
  lead_status: 'new' | 'in_progress' | 'follow_up' | 'closed_won' | 'closed_lost';
  lead_score: number;
  first_source: 'landing_page' | 'whatsapp' | 'manual';
  notes: string;
}
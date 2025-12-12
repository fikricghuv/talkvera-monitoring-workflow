export interface Appointment {
  id: string;
  client_id: string | null;
  contact_id: string | null;
  appointment_start: string;
  appointment_end: string | null;
  reason: string | null;
  source: 'landing_page' | 'whatsapp' | 'manual';
  booked_via_session_id: string | null;
  google_event_id: string | null;
  status: 'scheduled' | 'canceled' | 'rescheduled' | 'completed';
  created_at: string;
  updated_at: string;
  // Relations (optional, dari JOIN)
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_company?: string;
  contact_job_title?: string;
}

export interface AppointmentMetrics {
  totalAppointments: number;
  scheduledAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  todayAppointments: number;
}

export interface AppointmentFilterState {
  searchTerm: string;
  debouncedSearchTerm: string;
  statusFilter: string;
  startDate: string;
  endDate: string;
}

export interface AppointmentFormData {
  client_id?: string;
  contact_id?: string;
  appointment_start: string;
  appointment_end?: string;
  reason?: string;
  source: 'landing_page' | 'whatsapp' | 'manual';
  status: 'scheduled' | 'canceled' | 'rescheduled' | 'completed';
  google_event_id?: string;
}
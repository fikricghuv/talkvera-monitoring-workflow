export interface Patient {
  id: string;
  whatsapp_number: string;
  full_name: string | null;
  created_at: string;
  last_session_id: string | null;
}

export interface Appointment {
  id: string;
  patient_id: string;
  appointment_date_time: string;
  reason_for_visit: string | null;
  status: string;
  booked_via_session_id: string | null;
  google_calendar_event_id: string | null;
  created_at: string;
  updated_at: string | null;
  patient?: Patient;
}

export interface RawAppointmentData {
  id: string;
  patient_id: string;
  appointment_date_time: string;
  reason_for_visit: string | null;
  status: string;
  booked_via_session_id: string | null;
  google_calendar_event_id: string | null;
  created_at: string;
  updated_at: string | null;
  ms_patients?: Patient;
}

export interface AppointmentMetrics {
  totalAppointments: number;
  bookedAppointments: number;
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
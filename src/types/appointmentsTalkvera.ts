export interface Appointment {
  id: string;
  full_name: string;
  email: string;
  appointment_start: string;
  appointment_end: string | null;
  notes: string | null;
  source: string;
  google_event_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
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
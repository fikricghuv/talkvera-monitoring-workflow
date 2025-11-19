// types/patients.ts
export interface Patient {
  id: string;
  whatsapp_number: string;
  full_name: string | null;
  tanggal_lahir: string | null;
  gender: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  last_session_id: string | null;
}

export interface PatientMetrics {
  totalPatients: number;
  malePatients: number;
  femalePatients: number;
  completedProfiles: number;
  recentPatients: number;
}

export interface PatientFilterState {
  searchTerm: string;
  debouncedSearchTerm: string;
  genderFilter: string;
  startDate: string;
  endDate: string;
}
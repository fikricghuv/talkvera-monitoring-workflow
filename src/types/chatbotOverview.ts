// types/chatbotOverview.ts

export interface KPIData {
  totalPatients: number;
  activeSessions: number;
  completedSessions: number;
  totalMessages: number;
  totalAppointments: number;
  pendingAppointments: number;
}

export interface RecentSession {
  id: string;
  patient_name: string | null;
  whatsapp_number: string;
  start_time: string;
  status: string;
  total_messages: number;
  final_step_reached: string | null;
}

export interface RawRecentSession {
  id: string;
  patient_id: string;
  start_time: string;
  status: string;
  total_messages: number;
  final_step_reached: string | null;
  patient_name: string | null;
  whatsapp_number: string;
}

export interface SessionStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface OverviewData {
  kpiData: KPIData;
  recentSessions: RecentSession[];
  statusDistribution: SessionStatusDistribution[];
}
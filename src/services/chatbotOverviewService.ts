import { supabase } from "@/integrations/supabase/client";
import { 
  KPIData, 
  RecentSession, 
  SessionStatusDistribution,
  OverviewData 
} from "../types/chatbotOverview";
import { OVERVIEW_CONSTANTS } from "../constants/chatbotOverview";

/**
 * Service untuk handle semua operasi data chatbot overview
 * Disesuaikan dengan schema Supabase: ms_patients, dt_chat_sessions, dt_chat_messages, dt_appointments
 */
export class ChatbotOverviewService {
  /**
   * Fetch all overview data dengan date filter
   * @param startDate - Tanggal mulai filter (Date object)
   * @param endDate - Tanggal akhir filter (Date object)
   */
  static async fetchOverviewData(
    startDate: Date,
    endDate: Date
  ): Promise<OverviewData> {
    try {
      // Convert Date to ISO string for Supabase queries
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();

      // Fetch all data in parallel
      const [kpiData, recentSessions, statusDistribution] = await Promise.all([
        this.fetchKPIData(startDateStr, endDateStr),
        this.fetchRecentSessions(startDateStr, endDateStr),
        this.fetchStatusDistribution(startDateStr, endDateStr),
      ]);

      return {
        kpiData,
        recentSessions,
        statusDistribution,
      };
    } catch (error) {
      console.error("Error in fetchOverviewData:", error);
      throw error;
    }
  }

  /**
   * Fetch KPI data (metrics) dengan date filter
   */
  private static async fetchKPIData(startDate: string, endDate: string): Promise<KPIData> {
    try {
      const [
        newPatientsResult,
        activeSessionsResult,
        completedSessionsResult,
        messagesResult,
        appointmentsResult,
        pendingAppointmentsResult,
      ] = await Promise.all([
        // 1. Total New Patients (Registered in this period)
        // Menggunakan tabel ms_patients dan kolom created_at
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_PATIENTS)
          .select("id", { count: 'exact', head: true })
          .gte("created_at", startDate)
          .lte("created_at", endDate),
        
        // 2. Active Sessions (IN_PROGRESS)
        // Menggunakan dt_chat_sessions, kolom start_time
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_SESSIONS)
          .select("id", { count: 'exact', head: true })
          .eq("status", "IN_PROGRESS")
          .gte("start_time", startDate)
          .lte("start_time", endDate),
        
        // 3. Completed Sessions
        // Menggunakan dt_chat_sessions, kolom start_time
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_SESSIONS)
          .select("id", { count: 'exact', head: true })
          .eq("status", "COMPLETED")
          .gte("start_time", startDate)
          .lte("start_time", endDate),
        
        // 4. Total Messages
        // PERBAIKAN: Schema menggunakan kolom "timestamp", bukan "created_at"
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_MESSAGES)
          .select("id", { count: 'exact', head: true })
          .gte("timestamp", startDate)
          .lte("timestamp", endDate),
        
        // 5. Total Appointments
        // Menggunakan dt_appointments, kolom created_at (kapan dibuat) atau appointment_date_time (jadwal)
        // Disini kita pakai created_at untuk melihat booking yang DIBUAT pada periode ini
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_APPOINTMENTS)
          .select("id", { count: 'exact', head: true })
          .gte("created_at", startDate)
          .lte("created_at", endDate),
        
        // 6. Pending Appointments (BOOKED status)
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_APPOINTMENTS)
          .select("id", { count: 'exact', head: true })
          .eq("status", "BOOKED")
          .gte("created_at", startDate)
          .lte("created_at", endDate),
      ]);

      return {
        totalPatients: newPatientsResult.count || 0,
        activeSessions: activeSessionsResult.count || 0,
        completedSessions: completedSessionsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        totalAppointments: appointmentsResult.count || 0,
        pendingAppointments: pendingAppointmentsResult.count || 0,
      };
    } catch (error) {
      console.error("Error fetching KPI data:", error);
      // Return default values on error to prevent UI crash
      return {
        totalPatients: 0,
        activeSessions: 0,
        completedSessions: 0,
        totalMessages: 0,
        totalAppointments: 0,
        pendingAppointments: 0,
      };
    }
  }

  /**
   * Fetch recent sessions dengan join ke patients
   */
  private static async fetchRecentSessions(
    startDate: string, 
    endDate: string
  ): Promise<RecentSession[]> {
    try {
      // PERBAIKAN: Syntax select untuk join relation
      // ms_patients (full_name, whatsapp_number) akan mengambil data dari table relasi
      const { data, error } = await supabase
        .from(OVERVIEW_CONSTANTS.TABLE_SESSIONS)
        .select(`
          id,
          patient_id,
          start_time,
          status,
          total_messages,
          final_step_reached,
          ms_patients (
            full_name,
            whatsapp_number
          )
        `)
        .gte("start_time", startDate)
        .lte("start_time", endDate)
        .order("start_time", { ascending: false })
        .limit(OVERVIEW_CONSTANTS.RECENT_SESSIONS_LIMIT);

      if (error) throw error;

      // Mapping data result ke Interface
      const sessions: RecentSession[] = (data || []).map((session: any) => ({
        id: session.id,
        // Handle kemungkinan relation null
        patient_name: session.ms_patients?.full_name || "Tanpa Nama",
        whatsapp_number: session.ms_patients?.whatsapp_number || "-",
        start_time: session.start_time,
        status: session.status,
        total_messages: session.total_messages || 0,
        final_step_reached: session.final_step_reached || "Start",
      }));

      return sessions;
    } catch (error) {
      console.error("Error fetching recent sessions:", error);
      return [];
    }
  }

  /**
   * Fetch session status distribution untuk chart
   */
  private static async fetchStatusDistribution(
    startDate: string,
    endDate: string
  ): Promise<SessionStatusDistribution[]> {
    try {
      const { data, error } = await supabase
        .from(OVERVIEW_CONSTANTS.TABLE_SESSIONS)
        .select("status")
        .gte("start_time", startDate)
        .lte("start_time", endDate);

      if (error) throw error;

      const sessions = data || [];
      const total = sessions.length;

      // Group by status
      const statusCounts: Record<string, number> = {};
      sessions.forEach((session) => {
        const status = session.status || "UNKNOWN";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      // Convert ke array untuk Recharts/Chart UI
      const distribution: SessionStatusDistribution[] = Object.entries(statusCounts).map(
        ([status, count]) => ({
          status,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        })
      );

      return distribution;
    } catch (error) {
      console.error("Error fetching status distribution:", error);
      return [];
    }
  }
}
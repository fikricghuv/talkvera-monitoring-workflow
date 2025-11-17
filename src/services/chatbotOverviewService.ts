// services/chatbotOverviewService.ts

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
   * @param startDate - Tanggal mulai filter (ISO string)
   * @param endDate - Tanggal akhir filter (ISO string)
   */
  private static async fetchKPIData(startDate: string, endDate: string): Promise<KPIData> {
    try {
      // Fetch all data in parallel dengan date filter
      const [
        patientsResult,
        activeSessionsResult,
        completedSessionsResult,
        messagesResult,
        appointmentsResult,
        pendingAppointmentsResult,
      ] = await Promise.all([
        // Total Patients (count sessions dalam date range)
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_SESSIONS as any)
          .select("patient_id", { count: 'exact', head: true })
          .gte("start_time", startDate)
          .lte("start_time", endDate),
        
        // Active Sessions (IN_PROGRESS)
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_SESSIONS as any)
          .select("id", { count: 'exact', head: true })
          .eq("status", "IN_PROGRESS")
          .gte("start_time", startDate)
          .lte("start_time", endDate),
        
        // Completed Sessions
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_SESSIONS as any)
          .select("id", { count: 'exact', head: true })
          .eq("status", "COMPLETED")
          .gte("start_time", startDate)
          .lte("start_time", endDate),
        
        // Total Messages
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_MESSAGES as any)
          .select("id", { count: 'exact', head: true })
          .gte("created_at", startDate)
          .lte("created_at", endDate),
        
        // Total Appointments
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_APPOINTMENTS as any)
          .select("id", { count: 'exact', head: true })
          .gte("created_at", startDate)
          .lte("created_at", endDate),
        
        // Pending Appointments (BOOKED status)
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_APPOINTMENTS as any)
          .select("id", { count: 'exact', head: true })
          .eq("status", "BOOKED")
          .gte("created_at", startDate)
          .lte("created_at", endDate),
      ]);

      return {
        totalPatients: patientsResult.count || 0,
        activeSessions: activeSessionsResult.count || 0,
        completedSessions: completedSessionsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        totalAppointments: appointmentsResult.count || 0,
        pendingAppointments: pendingAppointmentsResult.count || 0,
      };
    } catch (error) {
      console.error("Error fetching KPI data:", error);
      throw error;
    }
  }

  /**
   * Fetch recent sessions dengan join ke patients dan date filter
   * @param startDate - Tanggal mulai filter (ISO string)
   * @param endDate - Tanggal akhir filter (ISO string)
   */
  private static async fetchRecentSessions(
    startDate: string, 
    endDate: string
  ): Promise<RecentSession[]> {
    try {
      const { data, error } = await supabase
        .from(OVERVIEW_CONSTANTS.TABLE_SESSIONS as any)
        .select(`
          id,
          patient_id,
          start_time,
          status,
          total_messages,
          final_step_reached,
          ms_patients:patient_id (
            full_name,
            whatsapp_number
          )
        `)
        .gte("start_time", startDate)
        .lte("start_time", endDate)
        .order("start_time", { ascending: false })
        .limit(OVERVIEW_CONSTANTS.RECENT_SESSIONS_LIMIT);

      if (error) throw error;

      // Process data
      const rawData = (data as any) || []; 
      
      const sessions: RecentSession[] = rawData.map((session: any) => ({
        id: session.id,
        patient_name: session.ms_patients?.full_name || null,
        whatsapp_number: session.ms_patients?.whatsapp_number || "Unknown",
        start_time: session.start_time,
        status: session.status,
        total_messages: session.total_messages || 0,
        final_step_reached: session.final_step_reached,
      }));

      return sessions;
    } catch (error) {
      console.error("Error fetching recent sessions:", error);
      return [];
    }
  }

  /**
   * Fetch session status distribution untuk chart dengan date filter
   * @param startDate - Tanggal mulai filter (ISO string)
   * @param endDate - Tanggal akhir filter (ISO string)
   */
  private static async fetchStatusDistribution(
    startDate: string,
    endDate: string
  ): Promise<SessionStatusDistribution[]> {
    try {
      const { data, error } = await supabase
        .from(OVERVIEW_CONSTANTS.TABLE_SESSIONS as any)
        .select("status")
        .gte("start_time", startDate)
        .lte("start_time", endDate);

      if (error) throw error;

      // Count by status
      const statusCounts: Record<string, number> = {};
      const sessions = data || [];
      
      sessions.forEach((session: any) => {
        const status = session.status || "UNKNOWN";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const total = sessions.length;
      
      // Convert to array with percentages
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
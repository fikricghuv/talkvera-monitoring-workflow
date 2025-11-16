// services/chatbotOverviewService.ts

import { supabase } from "@/integrations/supabase/client";
import { 
  KPIData, 
  RecentSession, 
  RawRecentSession,
  SessionStatusDistribution,
  OverviewData 
} from "../types/chatbotOverview";
import { OVERVIEW_CONSTANTS } from "../constants/chatbotOverview";

/**
 * Service untuk handle semua operasi data chatbot overview
 */
export class ChatbotOverviewService {
  /**
   * Fetch KPI data (metrics)
   */
  static async fetchKPIData(): Promise<KPIData> {
    try {
      // Fetch all data in parallel
      const [
        patientsResult,
        activeSessionsResult,
        completedSessionsResult,
        messagesResult,
        appointmentsResult,
        pendingAppointmentsResult,
      ] = await Promise.all([
        // Total Patients
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_PATIENTS)
          .select("id", { count: 'exact', head: true }),
        
        // Active Sessions (IN_PROGRESS)
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_SESSIONS)
          .select("id", { count: 'exact', head: true })
          .eq("status", "IN_PROGRESS"),
        
        // Completed Sessions
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_SESSIONS)
          .select("id", { count: 'exact', head: true })
          .eq("status", "COMPLETED"),
        
        // Total Messages
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_MESSAGES)
          .select("id", { count: 'exact', head: true }),
        
        // Total Appointments
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_APPOINTMENTS)
          .select("id", { count: 'exact', head: true }),
        
        // Pending Appointments (BOOKED status)
        supabase
          .from(OVERVIEW_CONSTANTS.TABLE_APPOINTMENTS)
          .select("id", { count: 'exact', head: true })
          .eq("status", "BOOKED"),
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
   * Fetch recent sessions dengan join ke patients
   */
  static async fetchRecentSessions(): Promise<RecentSession[]> {
    try {
      const { data, error } = await supabase
        .from(OVERVIEW_CONSTANTS.TABLE_SESSIONS)
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
      throw error;
    }
  }

  /**
   * Fetch session status distribution untuk chart
   */
  static async fetchStatusDistribution(): Promise<SessionStatusDistribution[]> {
    try {
      const { data, error } = await supabase
        .from(OVERVIEW_CONSTANTS.TABLE_SESSIONS)
        .select("status");

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
      throw error;
    }
  }

  /**
   * Fetch all overview data
   */
  static async fetchOverviewData(): Promise<OverviewData> {
    const [kpiData, recentSessions, statusDistribution] = await Promise.all([
      this.fetchKPIData(),
      this.fetchRecentSessions(),
      this.fetchStatusDistribution(),
    ]);

    return {
      kpiData,
      recentSessions,
      statusDistribution,
    };
  }
}
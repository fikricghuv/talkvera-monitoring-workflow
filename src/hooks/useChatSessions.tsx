import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ChatSession, 
  ChatSessionMetrics, 
  ChatSessionFilterState 
} from "@/types/chatSessions";
import { isChatToday } from "@/utils/chatSessionUtils";

export const useChatSessions = (
  filters: ChatSessionFilterState,
  currentPage: number,
  itemsPerPage: number
) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [metrics, setMetrics] = useState<ChatSessionMetrics>({
    totalSessions: 0,
    activeSessions: 0,
    completedSessions: 0,
    todaySessions: 0,
    avgMessagesPerSession: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [uniqueStatuses, setUniqueStatuses] = useState<string[]>([]);

  const createBaseQuery = () => {
    return supabase.from("dt_chat_sessions" as any);
  };

  const applyCommonFilters = (query: any) => {
    if (filters.startDate) {
      const startDateTime = new Date(filters.startDate);
      startDateTime.setHours(0, 0, 0, 0);
      query = query.gte("start_time", startDateTime.toISOString());
    }

    if (filters.endDate) {
      const endDateTime = new Date(filters.endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte("start_time", endDateTime.toISOString());
    }

    return query;
  };

  const fetchUniqueStatuses = async () => {
    try {
      const { data } = await supabase
        .from("dt_chat_sessions" as any)
        .select("status")
        .not("status", "is", null);

      if (data) {
        const statuses = Array.from(new Set(data.map((d: any) => d.status))).sort();
        setUniqueStatuses(statuses as string[]);
      }
    } catch (error) {
      console.error("Error fetching unique statuses:", error);
    }
  };

  const fetchMetrics = async () => {
    try {
      let query = createBaseQuery()
        .select("*, ms_patients!dt_chat_sessions_patient_id_fkey(*)");

      query = applyCommonFilters(query);

      if (filters.statusFilter !== "all") {
        query = query.eq("status", filters.statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const rawData = data as any[];
        const processedData: ChatSession[] = rawData.map((item: any) => ({
          ...item,
          patient: item.ms_patients
        }));

        const totalSessions = processedData.length;
        const activeSessions = processedData.filter(
          s => s.status === "IN_PROGRESS"
        ).length;
        const completedSessions = processedData.filter(
          s => s.status === "COMPLETED"
        ).length;
        const todaySessions = processedData.filter(
          s => isChatToday(s.start_time)
        ).length;
        const totalMessages = processedData.reduce((sum, s) => sum + (s.total_messages || 0), 0);
        const avgMessagesPerSession = totalSessions > 0 
          ? Math.round(totalMessages / totalSessions) 
          : 0;

        setMetrics({
          totalSessions,
          activeSessions,
          completedSessions,
          todaySessions,
          avgMessagesPerSession
        });
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
      toast.error("Gagal memuat statistik");
    }
  };

  const fetchChatSessions = async () => {
    setIsLoading(true);

    try {
      let query = createBaseQuery()
        .select("*, ms_patients!dt_chat_sessions_patient_id_fkey(*)");

      query = applyCommonFilters(query);

      if (filters.statusFilter !== "all") {
        query = query.eq("status", filters.statusFilter);
      }

      query = query.order("start_time", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      let rawData = data as any[] | null;
      let allSessions: ChatSession[] = (rawData || []).map((item: any) => ({
        ...item,
        patient: item.ms_patients
      }));

      // Client-side filtering untuk search
      if (filters.debouncedSearchTerm && filters.debouncedSearchTerm.length >= 3) {
        const searchLower = filters.debouncedSearchTerm.toLowerCase();
        allSessions = allSessions.filter(s => {
          const patientName = s.patient?.full_name?.toLowerCase() || '';
          const whatsapp = s.patient?.whatsapp_number?.toLowerCase() || '';
          const finalStep = s.final_step_reached?.toLowerCase() || '';
          
          return patientName.includes(searchLower) || 
                 whatsapp.includes(searchLower) || 
                 finalStep.includes(searchLower);
        });
      }

      const totalFiltered = allSessions.length;
      
      // Client-side pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage;
      const paginatedData = allSessions.slice(from, to);

      setSessions(paginatedData);
      setTotalCount(totalFiltered);

      await fetchMetrics();

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      toast.error("Gagal memuat data chat session");
      setIsLoading(false);
    }
  };

  const updateSessionStatus = async (id: string, newStatus: string) => {
    try {
      const updateData: any = { 
        status: newStatus
      };

      // Jika status menjadi completed, set end_time
      if (newStatus === "COMPLETED" || newStatus === "ENDED") {
        updateData.end_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from("dt_chat_sessions" as any)
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast.success("Status chat session berhasil diupdate");
      fetchChatSessions();
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("Gagal mengupdate status chat session");
    }
  };

  const refetch = () => {
    fetchChatSessions();
    fetchUniqueStatuses();
  };

  useEffect(() => {
    fetchUniqueStatuses();
  }, []);

  useEffect(() => {
    fetchChatSessions();
  }, [
    currentPage,
    itemsPerPage,
    filters.debouncedSearchTerm,
    filters.statusFilter,
    filters.startDate,
    filters.endDate
  ]);

  return {
    sessions,
    metrics,
    isLoading,
    totalCount,
    uniqueStatuses,
    refetch,
    updateSessionStatus
  };
};
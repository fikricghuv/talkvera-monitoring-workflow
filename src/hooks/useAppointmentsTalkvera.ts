import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Appointment, 
  AppointmentMetrics, 
  AppointmentFilterState 
} from "@/types/appointmentsTalkvera";
import { isAppointmentToday } from "@/utils/appointmentTalkveraUtils";

export const useAppointments = (
  filters: AppointmentFilterState,
  currentPage: number,
  itemsPerPage: number
) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [metrics, setMetrics] = useState<AppointmentMetrics>({
    totalAppointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    todayAppointments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [uniqueStatuses, setUniqueStatuses] = useState<string[]>([]);

  const createBaseQuery = () => {
    return supabase.from("dt_talkvera_appointments");
  };

  const applyCommonFilters = (query: any) => {
    if (filters.startDate) {
      const startDateTime = new Date(filters.startDate);
      startDateTime.setHours(0, 0, 0, 0);
      query = query.gte("appointment_start", startDateTime.toISOString());
    }

    if (filters.endDate) {
      const endDateTime = new Date(filters.endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte("appointment_start", endDateTime.toISOString());
    }

    return query;
  };

  const fetchUniqueStatuses = async () => {
    try {
      const { data } = await supabase
        .from("dt_talkvera_appointments")
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
      let query = createBaseQuery().select("*");

      query = applyCommonFilters(query);

      if (filters.statusFilter !== "all") {
        query = query.eq("status", filters.statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const processedData: Appointment[] = data as Appointment[];

        const totalAppointments = processedData.length;
        const scheduledAppointments = processedData.filter(
          a => a.status === "scheduled"
        ).length;
        const completedAppointments = processedData.filter(
          a => a.status === "completed"
        ).length;
        const cancelledAppointments = processedData.filter(
          a => a.status === "canceled"
        ).length;
        const todayAppointments = processedData.filter(
          a => isAppointmentToday(a.appointment_start)
        ).length;

        setMetrics({
          totalAppointments,
          scheduledAppointments,
          completedAppointments,
          cancelledAppointments,
          todayAppointments
        });
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
      toast.error("Gagal memuat statistik");
    }
  };

  const fetchAppointments = async () => {
    setIsLoading(true);

    try {
      let query = createBaseQuery().select("*");

      query = applyCommonFilters(query);

      if (filters.statusFilter !== "all") {
        query = query.eq("status", filters.statusFilter);
      }

      query = query.order("appointment_start", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      let allAppointments: Appointment[] = (data || []) as Appointment[];

      // Client-side filtering untuk search
      if (filters.debouncedSearchTerm && filters.debouncedSearchTerm.length >= 3) {
        const searchLower = filters.debouncedSearchTerm.toLowerCase();
        allAppointments = allAppointments.filter(a => {
          const fullName = a.full_name?.toLowerCase() || '';
          const email = a.email?.toLowerCase() || '';
          const notes = a.notes?.toLowerCase() || '';
          
          return fullName.includes(searchLower) || 
                 email.includes(searchLower) || 
                 notes.includes(searchLower);
        });
      }

      const totalFiltered = allAppointments.length;
      
      // Client-side pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage;
      const paginatedData = allAppointments.slice(from, to);

      setAppointments(paginatedData);
      setTotalCount(totalFiltered);

      await fetchMetrics();

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Gagal memuat data appointment");
      setIsLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("dt_talkvera_appointments")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Status appointment berhasil diupdate");
      fetchAppointments();
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Gagal mengupdate status appointment");
    }
  };

  const refetch = () => {
    fetchAppointments();
    fetchUniqueStatuses();
  };

  useEffect(() => {
    fetchUniqueStatuses();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [
    currentPage,
    itemsPerPage,
    filters.debouncedSearchTerm,
    filters.statusFilter,
    filters.startDate,
    filters.endDate
  ]);

  return {
    appointments,
    metrics,
    isLoading,
    totalCount,
    uniqueStatuses,
    refetch,
    updateAppointmentStatus
  };
};
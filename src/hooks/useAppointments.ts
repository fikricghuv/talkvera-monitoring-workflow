import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Appointment, 
  RawAppointmentData, 
  AppointmentMetrics, 
  AppointmentFilterState 
} from "@/types/appointments";
import { isAppointmentToday } from "@/utils/appointmentUtils";

export const useAppointments = (
  filters: AppointmentFilterState,
  currentPage: number,
  itemsPerPage: number
) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [metrics, setMetrics] = useState<AppointmentMetrics>({
    totalAppointments: 0,
    bookedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    todayAppointments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [uniqueStatuses, setUniqueStatuses] = useState<string[]>([]);

  const createBaseQuery = () => {
    return supabase.from("dt_appointments" as any);
  };

  const applyCommonFilters = (query: any) => {
    // Untuk search di patient data, kita perlu melakukan filtering setelah join
    // karena OR search dengan nested field tidak didukung langsung di query builder
    
    if (filters.startDate) {
      const startDateTime = new Date(filters.startDate);
      startDateTime.setHours(0, 0, 0, 0);
      query = query.gte("appointment_date_time", startDateTime.toISOString());
    }

    if (filters.endDate) {
      const endDateTime = new Date(filters.endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte("appointment_date_time", endDateTime.toISOString());
    }

    return query;
  };

  const fetchUniqueStatuses = async () => {
    try {
      const { data } = await supabase
        .from("dt_appointments" as any)
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
        .select("*, ms_patients!dt_appointments_patient_id_fkey(*)");

      query = applyCommonFilters(query);

      if (filters.statusFilter !== "all") {
        query = query.eq("status", filters.statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const rawData = data as any[];
        const processedData: Appointment[] = rawData.map((item: any) => ({
          ...item,
          patient: item.ms_patients
        }));

        const totalAppointments = processedData.length;
        const bookedAppointments = processedData.filter(
          a => a.status === "BOOKED" || a.status === "CONFIRMED"
        ).length;
        const completedAppointments = processedData.filter(
          a => a.status === "COMPLETED"
        ).length;
        const cancelledAppointments = processedData.filter(
          a => a.status === "CANCELLED"
        ).length;
        const todayAppointments = processedData.filter(
          a => isAppointmentToday(a.appointment_date_time)
        ).length;

        setMetrics({
          totalAppointments,
          bookedAppointments,
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
      let query = createBaseQuery()
        .select("*, ms_patients!dt_appointments_patient_id_fkey(*)");

      query = applyCommonFilters(query);

      if (filters.statusFilter !== "all") {
        query = query.eq("status", filters.statusFilter);
      }

      query = query.order("appointment_date_time", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      let rawData = data as any[] | null;
      let allAppointments: Appointment[] = (rawData || []).map((item: any) => ({
        ...item,
        patient: item.ms_patients
      }));

      // Client-side filtering untuk search
      if (filters.debouncedSearchTerm && filters.debouncedSearchTerm.length >= 3) {
        const searchLower = filters.debouncedSearchTerm.toLowerCase();
        allAppointments = allAppointments.filter(a => {
          const patientName = a.patient?.full_name?.toLowerCase() || '';
          const whatsapp = a.patient?.whatsapp_number?.toLowerCase() || '';
          const reason = a.reason_for_visit?.toLowerCase() || '';
          
          return patientName.includes(searchLower) || 
                 whatsapp.includes(searchLower) || 
                 reason.includes(searchLower);
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
      // PostgreSQL TIMESTAMP WITH TIME ZONE akan otomatis handle timezone
      // Kita kirim waktu current dalam ISO format, PostgreSQL akan convert ke UTC
      const { error } = await supabase
        .from("dt_appointments" as any)
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString() // Kirim ISO format, PostgreSQL handle timezone
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
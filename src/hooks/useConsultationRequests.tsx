// hooks/useConsultationRequests.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ConsultationRequest, 
  ConsultationMetrics, 
  ConsultationFilterState 
} from "@/types/consultationRequests";
import { isCreatedToday } from "@/utils/consultationUtils";

export const useConsultationRequests = (
  filters: ConsultationFilterState,
  currentPage: number,
  itemsPerPage: number
) => {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [metrics, setMetrics] = useState<ConsultationMetrics>({
    totalRequests: 0,
    newRequests: 0,
    greetingsSent: 0,
    inFollowUp: 0,
    replied: 0,
    qualified: 0,
    closedWon: 0,
    closedLost: 0,
    todayRequests: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [uniqueStatuses, setUniqueStatuses] = useState<string[]>([]);
  const [uniqueCompanySizes, setUniqueCompanySizes] = useState<string[]>([]);

  const fetchUniqueFilters = async () => {
    try {
      const { data: statusData } = await supabase
        .from("dt_consultation_requests")
        .select("consultation_status")
        .not("consultation_status", "is", null);

      const { data: sizeData } = await supabase
        .from("dt_consultation_requests")
        .select("company_size")
        .not("company_size", "is", null);

      if (statusData) {
        const statuses = Array.from(new Set(statusData.map((d: any) => d.consultation_status))).sort();
        setUniqueStatuses(statuses as string[]);
      }

      if (sizeData) {
        const sizes = Array.from(new Set(sizeData.map((d: any) => d.company_size))).sort();
        setUniqueCompanySizes(sizes as string[]);
      }
    } catch (error) {
      console.error("Error fetching unique filters:", error);
    }
  };

  const fetchMetrics = async () => {
    try {
      let query = supabase.from("dt_consultation_requests").select("*");

      if (filters.statusFilter !== "all") {
        query = query.eq("consultation_status", filters.statusFilter);
      }

      if (filters.companySizeFilter !== "all") {
        query = query.eq("company_size", filters.companySizeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const totalRequests = data.length;
        const newRequests = data.filter(r => r.consultation_status === "new").length;
        const greetingsSent = data.filter(r => r.consultation_status === "greetings_sent").length;
        const inFollowUp = data.filter(r => 
          ['follow_up_1_sent', 'follow_up_2_sent', 'follow_up_3_sent'].includes(r.consultation_status)
        ).length;
        const replied = data.filter(r => r.consultation_status === "replied").length;
        const qualified = data.filter(r => r.consultation_status === "qualified").length;
        const closedWon = data.filter(r => r.consultation_status === "closed_won").length;
        const closedLost = data.filter(r => r.consultation_status === "closed_lost").length;
        const todayRequests = data.filter(r => isCreatedToday(r.submitted_at)).length;

        setMetrics({
          totalRequests,
          newRequests,
          greetingsSent,
          inFollowUp,
          replied,
          qualified,
          closedWon,
          closedLost,
          todayRequests
        });
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
      toast.error("Gagal memuat statistik");
    }
  };

  const fetchRequests = async () => {
    setIsLoading(true);

    try {
      let query = supabase
        .from("dt_consultation_requests")
        .select(`
          *,
          contact:dt_crm_contacts(
            full_name,
            email,
            phone,
            company
          )
        `);

      if (filters.statusFilter !== "all") {
        query = query.eq("consultation_status", filters.statusFilter);
      }

      if (filters.companySizeFilter !== "all") {
        query = query.eq("company_size", filters.companySizeFilter);
      }

      query = query.order("submitted_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      let allRequests: ConsultationRequest[] = (data || []) as ConsultationRequest[];

      // Client-side filtering for search
      if (filters.debouncedSearchTerm && filters.debouncedSearchTerm.length >= 3) {
        const searchLower = filters.debouncedSearchTerm.toLowerCase();
        allRequests = allRequests.filter(r => {
          const contactName = r.contact?.full_name?.toLowerCase() || '';
          const contactEmail = r.contact?.email?.toLowerCase() || '';
          const contactCompany = r.contact?.company?.toLowerCase() || '';
          const website = r.website?.toLowerCase() || '';
          const description = r.describe_consultation?.toLowerCase() || '';
          
          return contactName.includes(searchLower) || 
                 contactEmail.includes(searchLower) || 
                 contactCompany.includes(searchLower) ||
                 website.includes(searchLower) ||
                 description.includes(searchLower);
        });
      }

      const totalFiltered = allRequests.length;
      
      // Client-side pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage;
      const paginatedData = allRequests.slice(from, to);

      setRequests(paginatedData);
      setTotalCount(totalFiltered);

      await fetchMetrics();

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching consultation requests:", error);
      toast.error("Gagal memuat data konsultasi");
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("dt_consultation_requests")
        .update({ 
          consultation_status: status,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Status berhasil diupdate");
      fetchRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Gagal mengupdate status");
    }
  };

  const refetch = () => {
    fetchRequests();
    fetchUniqueFilters();
  };

  useEffect(() => {
    fetchUniqueFilters();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [
    currentPage,
    itemsPerPage,
    filters.debouncedSearchTerm,
    filters.statusFilter,
    filters.companySizeFilter
  ]);

  return {
    requests,
    metrics,
    isLoading,
    totalCount,
    uniqueStatuses,
    uniqueCompanySizes,
    refetch,
    updateRequestStatus
  };
};
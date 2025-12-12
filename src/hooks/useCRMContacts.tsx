// hooks/useCRMContacts.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  CRMContact, 
  CRMMetrics, 
  CRMFilterState,
  CRMFormData 
} from "@/types/crmContacts";
import { isCreatedToday } from "@/utils/crmUtils";

export const useCRMContacts = (
  filters: CRMFilterState,
  currentPage: number,
  itemsPerPage: number
) => {
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [metrics, setMetrics] = useState<CRMMetrics>({
    totalContacts: 0,
    leadContacts: 0,
    qualifiedContacts: 0,
    customerContacts: 0,
    todayContacts: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [uniqueLifecycleStages, setUniqueLifecycleStages] = useState<string[]>([]);
  const [uniqueLeadStatuses, setUniqueLeadStatuses] = useState<string[]>([]);

  const createBaseQuery = () => {
    return supabase.from("dt_crm_contacts");
  };

  const applyCommonFilters = (query: any) => {
    // Add any common filters here if needed
    return query;
  };

  const fetchUniqueStatuses = async () => {
    try {
      const { data: lifecycleData } = await supabase
        .from("dt_crm_contacts")
        .select("lifecycle_stage")
        .not("lifecycle_stage", "is", null);

      const { data: leadStatusData } = await supabase
        .from("dt_crm_contacts")
        .select("lead_status")
        .not("lead_status", "is", null);

      if (lifecycleData) {
        const stages = Array.from(new Set(lifecycleData.map((d: any) => d.lifecycle_stage))).sort();
        setUniqueLifecycleStages(stages as string[]);
      }

      if (leadStatusData) {
        const statuses = Array.from(new Set(leadStatusData.map((d: any) => d.lead_status))).sort();
        setUniqueLeadStatuses(statuses as string[]);
      }
    } catch (error) {
      console.error("Error fetching unique statuses:", error);
    }
  };

  const fetchMetrics = async () => {
    try {
      let query = createBaseQuery().select("*");
      query = applyCommonFilters(query);

      if (filters.lifecycleFilter !== "all") {
        query = query.eq("lifecycle_stage", filters.lifecycleFilter);
      }

      if (filters.leadStatusFilter !== "all") {
        query = query.eq("lead_status", filters.leadStatusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const processedData: CRMContact[] = data as CRMContact[];

        const totalContacts = processedData.length;
        const leadContacts = processedData.filter(
          c => c.lifecycle_stage === "lead"
        ).length;
        const qualifiedContacts = processedData.filter(
          c => c.lifecycle_stage === "qualified"
        ).length;
        const customerContacts = processedData.filter(
          c => c.lifecycle_stage === "customer"
        ).length;
        const todayContacts = processedData.filter(
          c => isCreatedToday(c.created_at)
        ).length;

        setMetrics({
          totalContacts,
          leadContacts,
          qualifiedContacts,
          customerContacts,
          todayContacts
        });
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
      toast.error("Gagal memuat statistik");
    }
  };

  const fetchContacts = async () => {
    setIsLoading(true);

    try {
      let query = createBaseQuery().select("*");
      query = applyCommonFilters(query);

      if (filters.lifecycleFilter !== "all") {
        query = query.eq("lifecycle_stage", filters.lifecycleFilter);
      }

      if (filters.leadStatusFilter !== "all") {
        query = query.eq("lead_status", filters.leadStatusFilter);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      let allContacts: CRMContact[] = (data || []) as CRMContact[];

      // Client-side filtering untuk search
      if (filters.debouncedSearchTerm && filters.debouncedSearchTerm.length >= 3) {
        const searchLower = filters.debouncedSearchTerm.toLowerCase();
        allContacts = allContacts.filter(c => {
          const fullName = c.full_name?.toLowerCase() || '';
          const email = c.email?.toLowerCase() || '';
          const company = c.company?.toLowerCase() || '';
          const notes = c.notes?.toLowerCase() || '';
          
          return fullName.includes(searchLower) || 
                 email.includes(searchLower) || 
                 company.includes(searchLower) ||
                 notes.includes(searchLower);
        });
      }

      const totalFiltered = allContacts.length;
      
      // Client-side pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage;
      const paginatedData = allContacts.slice(from, to);

      setContacts(paginatedData);
      setTotalCount(totalFiltered);

      await fetchMetrics();

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Gagal memuat data kontak");
      setIsLoading(false);
    }
  };

  const createContact = async (formData: CRMFormData) => {
    try {
      const { data, error } = await supabase
        .from("dt_crm_contacts")
        .insert([{
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          gender: formData.gender || null,
          company: formData.company || null,
          job_title: formData.job_title || null,
          city: formData.city || null,
          country: formData.country || null,
          lifecycle_stage: formData.lifecycle_stage,
          lead_status: formData.lead_status,
          lead_score: formData.lead_score,
          first_source: formData.first_source,
          notes: formData.notes || null,
          first_seen_at: new Date().toISOString(),
          last_interaction_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      toast.success("Kontak berhasil ditambahkan");
      fetchContacts();
      return data;
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("Gagal menambahkan kontak");
      throw error;
    }
  };

  const updateContact = async (id: string, updates: Partial<CRMContact>) => {
    try {
      const { error } = await supabase
        .from("dt_crm_contacts")
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Kontak berhasil diupdate");
      fetchContacts();
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Gagal mengupdate kontak");
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from("dt_crm_contacts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Kontak berhasil dihapus");
      fetchContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Gagal menghapus kontak");
    }
  };

  const refetch = () => {
    fetchContacts();
    fetchUniqueStatuses();
  };

  useEffect(() => {
    fetchUniqueStatuses();
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [
    currentPage,
    itemsPerPage,
    filters.debouncedSearchTerm,
    filters.lifecycleFilter,
    filters.leadStatusFilter
  ]);

  return {
    contacts,
    metrics,
    isLoading,
    totalCount,
    uniqueLifecycleStages,
    uniqueLeadStatuses,
    refetch,
    createContact,
    updateContact,
    deleteContact
  };
};
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Patient, 
  PatientMetrics, 
  PatientFilterState 
} from "@/types/patients";

export const usePatients = (
  filters: PatientFilterState,
  currentPage: number,
  itemsPerPage: number
) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [metrics, setMetrics] = useState<PatientMetrics>({
    totalPatients: 0,
    malePatients: 0,
    femalePatients: 0,
    completedProfiles: 0,
    recentPatients: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const createBaseQuery = () => {
    return supabase.from("ms_patients" as any);
  };

  const applyCommonFilters = (query: any) => {
    if (filters.startDate) {
      const startDateTime = new Date(filters.startDate);
      startDateTime.setHours(0, 0, 0, 0);
      query = query.gte("created_at", startDateTime.toISOString());
    }

    if (filters.endDate) {
      const endDateTime = new Date(filters.endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte("created_at", endDateTime.toISOString());
    }

    return query;
  };

  const fetchMetrics = async () => {
    try {
      let query = createBaseQuery().select("*");
      query = applyCommonFilters(query);

      if (filters.genderFilter !== "all") {
        query = query.eq("gender", filters.genderFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const totalPatients = data.length;
        const malePatients = data.filter(p => p.gender?.toLowerCase() === "male").length;
        const femalePatients = data.filter(p => p.gender?.toLowerCase() === "female").length;
        const completedProfiles = data.filter(
          p => p.full_name && p.tanggal_lahir && p.gender
        ).length;

        // Recent patients (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentPatients = data.filter(
          p => new Date(p.created_at) >= sevenDaysAgo
        ).length;

        setMetrics({
          totalPatients,
          malePatients,
          femalePatients,
          completedProfiles,
          recentPatients
        });
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
      toast.error("Gagal memuat statistik");
    }
  };

  const fetchPatients = async () => {
    setIsLoading(true);

    try {
      let query = createBaseQuery().select("*");
      query = applyCommonFilters(query);

      if (filters.genderFilter !== "all") {
        query = query.eq("gender", filters.genderFilter);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      let allPatients: Patient[] = (data as Patient[]) || [];

      // Client-side filtering untuk search
      if (filters.debouncedSearchTerm && filters.debouncedSearchTerm.length >= 3) {
        const searchLower = filters.debouncedSearchTerm.toLowerCase();
        allPatients = allPatients.filter(p => {
          const fullName = p.full_name?.toLowerCase() || '';
          const whatsapp = p.whatsapp_number?.toLowerCase() || '';
          
          return fullName.includes(searchLower) || whatsapp.includes(searchLower);
        });
      }

      const totalFiltered = allPatients.length;
      
      // Client-side pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage;
      const paginatedData = allPatients.slice(from, to);

      setPatients(paginatedData);
      setTotalCount(totalFiltered);

      await fetchMetrics();

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Gagal memuat data patient");
      setIsLoading(false);
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      const { error } = await supabase
        .from("ms_patients" as any)
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Data patient berhasil diupdate");
      fetchPatients();
    } catch (error) {
      console.error("Error updating patient:", error);
      toast.error("Gagal mengupdate data patient");
    }
  };

  const refetch = () => {
    fetchPatients();
  };

  useEffect(() => {
    fetchPatients();
  }, [
    currentPage,
    itemsPerPage,
    filters.debouncedSearchTerm,
    filters.genderFilter,
    filters.startDate,
    filters.endDate
  ]);

  return {
    patients,
    metrics,
    isLoading,
    totalCount,
    refetch,
    updatePatient
  };
};
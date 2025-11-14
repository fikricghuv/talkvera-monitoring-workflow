import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QueueItem, RawQueueData, QueueKPI, QueueFilterState } from "@/types/processQueue";

export const useProcessQueue = (
  filters: QueueFilterState,
  currentPage: number,
  itemsPerPage: number
) => {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [kpiData, setKpiData] = useState<QueueKPI>({
    newQueue: 0,
    processed: 0,
    failed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Helper untuk membuat base query
  const createBaseQuery = () => {
    return supabase.from("dt_execution_process_queue");
  };

  // Apply common filters ke query
  const applyCommonFilters = (query: any) => {
    // Filter pencarian
    if (filters.debouncedSearchTerm && filters.debouncedSearchTerm.length >= 3) {
      const searchFilter = `execution_id.ilike.%${filters.debouncedSearchTerm}%,workflow_id.ilike.%${filters.debouncedSearchTerm}%`;
      query = query.or(searchFilter);
    }
    
    // Filter periode (startDate)
    if (filters.startDate) {
      const startDateTime = new Date(filters.startDate);
      startDateTime.setHours(0, 0, 0, 0);
      query = query.gte("created_at", startDateTime.toISOString());
    }
    
    // Filter periode (endDate)
    if (filters.endDate) {
      const endDateTime = new Date(filters.endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte("created_at", endDateTime.toISOString());
    }
    
    return query;
  };

  // Fetch KPI data
  const fetchKPIData = async () => {
    try {
      if (filters.statusFilter !== "all") {
        let query = createBaseQuery()
          .select("id", { count: 'exact', head: true })
          .eq("status", filters.statusFilter);
        
        query = applyCommonFilters(query);
        
        const result = await query;
        const count = result.count || 0;
        
        setKpiData({
          newQueue: filters.statusFilter === "pending" ? count : 0,
          processed: filters.statusFilter === "done" ? count : 0,
          failed: filters.statusFilter === "failed" ? count : 0,
        });
      } else {
        const createStatusQuery = (status: string) => {
          let query = createBaseQuery()
            .select("id", { count: 'exact', head: true })
            .eq("status", status);
          
          query = applyCommonFilters(query);
          return query;
        };

        const [pendingResult, doneResult, failedResult] = await Promise.all([
          createStatusQuery("pending"),
          createStatusQuery("done"),
          createStatusQuery("failed")
        ]);

        setKpiData({
          newQueue: pendingResult.count || 0,
          processed: doneResult.count || 0,
          failed: failedResult.count || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching KPI:", error);
      toast.error("Gagal memuat data statistik KPI");
    }
  };

  // Fetch data utama
  const fetchData = async () => {
    setIsLoading(true);

    try {
      let query = createBaseQuery().select("*", { count: 'exact' });

      // Apply common filters
      query = applyCommonFilters(query);

      // Filter status
      if (filters.statusFilter !== "all") {
        query = query.eq("status", filters.statusFilter);
      }

      // Pagination & sorting
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      query = query
        .order("created_at", { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching queue:", error);
        toast.error("Gagal memuat data antrian");
        setIsLoading(false);
        return;
      }

      const rawData = (data as unknown) as RawQueueData[] | null;
      const processedData: QueueItem[] = (rawData || []).map((item) => ({
        id: item.id,
        execution_id: item.execution_id,
        workflow_id: item.workflow_id,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setQueueItems(processedData);
      setTotalCount(count || 0);
      
      await fetchKPIData();
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error in fetchData:", error);
      toast.error("Terjadi kesalahan saat memuat data");
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, filters.debouncedSearchTerm, filters.statusFilter, filters.startDate, filters.endDate]);

  return {
    queueItems,
    kpiData,
    isLoading,
    totalCount,
    refetch
  };
};
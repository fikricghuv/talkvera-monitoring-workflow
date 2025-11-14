// hooks/useWorkflowInformationData.ts

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { WorkflowInformationService } from "../services/workflowInformationService";
import { WorkflowInfo, KPIData, FilterState, PaginationState } from "@/types/workflowInformation";

/**
 * Custom hook untuk fetch dan manage workflow data
 * @param filters - Filter state
 * @param pagination - Pagination state
 * @returns Object dengan workflows, totalCount, kpiData, isLoading, dan refetch function
 */
export const useWorkflowInformationData = (
  filters: FilterState, 
  pagination: PaginationState
) => {
  const [workflows, setWorkflows] = useState<WorkflowInfo[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [kpiData, setKpiData] = useState<KPIData>({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalTimeSaved: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch data dari service
   */
  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch workflows dan KPI data secara parallel
      const [workflowData, kpiResult] = await Promise.all([
        WorkflowInformationService.fetchWorkflows(filters, pagination),
        WorkflowInformationService.fetchKPIData(filters),
      ]);

      setWorkflows(workflowData.workflows);
      setTotalCount(workflowData.totalCount);
      setKpiData(kpiResult);
    } catch (error) {
      console.error("Error fetching workflow data:", error);
      toast.error("Gagal memuat data workflow");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data saat dependencies berubah
  useEffect(() => {
    fetchData();
  }, [
    pagination.currentPage,
    pagination.itemsPerPage,
    filters.debouncedSearchTerm,
    filters.statusFilter,
    filters.startDate,
    filters.endDate,
  ]);

  return { 
    workflows, 
    totalCount, 
    kpiData, 
    isLoading, 
    refetch: fetchData 
  };
};
// hooks/useWorkflowExecutionData.ts

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { WorkflowExecutionService } from "../services/workflowExecutionService";
import { WorkflowExecution, KPIData, FilterState, PaginationState } from "../types/workflowExecution";

/**
 * Custom hook untuk fetch dan manage workflow execution data
 * @param filters - Filter state
 * @param pagination - Pagination state
 * @returns Object dengan executions, totalCount, kpiData, isLoading, dan refetch function
 */
export const useWorkflowExecutionData = (
  filters: FilterState, 
  pagination: PaginationState
) => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [kpiData, setKpiData] = useState<KPIData>({
    totalExecutions: 0,
    failedExecutions: 0,
    totalCost: 0,
    totalTokens: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch data dari service
   */
  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch executions dan KPI data secara parallel
      const [executionData, kpiResult] = await Promise.all([
        WorkflowExecutionService.fetchExecutions(filters, pagination),
        WorkflowExecutionService.fetchKPIData(filters),
      ]);

      setExecutions(executionData.executions);
      setTotalCount(executionData.totalCount);
      setKpiData(kpiResult);
    } catch (error) {
      console.error("Error fetching execution data:", error);
      toast.error("Gagal memuat data eksekusi");
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
    executions, 
    totalCount, 
    kpiData, 
    isLoading, 
    refetch: fetchData 
  };
};
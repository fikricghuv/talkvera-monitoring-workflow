import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NodeExecution, RawNodeExecution, MetricsData, FilterState } from "@/types/nodeExecution";

export const useNodeExecutions = (
  filters: FilterState,
  currentPage: number,
  itemsPerPage: number
) => {
  const [nodeExecutions, setNodeExecutions] = useState<NodeExecution[]>([]);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [uniqueStatuses, setUniqueStatuses] = useState<string[]>([]);

  const processRawData = (rawData: RawNodeExecution[]): NodeExecution[] => {
    return rawData.map((raw) => ({
      ...raw,
      estimated_cost_usd: Number(raw.estimated_cost_usd || 0),
      token_estimation_accuracy: raw.token_estimation_accuracy 
        ? Number(raw.token_estimation_accuracy) 
        : null,
    }));
  };

  const buildQuery = (baseQuery: any, includeFilters: boolean = true) => {
    let query = baseQuery;

    if (includeFilters) {
      if (filters.debouncedSearchTerm && filters.debouncedSearchTerm.length >= 3) {
        query = query.or(
          `node_name.ilike.%${filters.debouncedSearchTerm}%,model_name.ilike.%${filters.debouncedSearchTerm}%,execution_id.ilike.%${filters.debouncedSearchTerm}%`
        );
      }

      if (filters.statusFilter !== "all") {
        query = query.eq("execution_status", filters.statusFilter);
      }

      if (filters.startDate) {
        const startDateTime = new Date(filters.startDate);
        startDateTime.setHours(0, 0, 0, 0);
        query = query.gte("inserted_at", startDateTime.toISOString());
      }

      if (filters.endDate) {
        const endDateTime = new Date(filters.endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query = query.lte("inserted_at", endDateTime.toISOString());
      }
    }

    return query;
  };

  const fetchUniqueValues = async () => {
    try {
      const { data: statusData } = await supabase
        .from("dt_node_executions")
        .select("execution_status")
        .not("execution_status", "is", null);
      
      if (statusData) {
        const statuses = Array.from(
          new Set(statusData.map(d => d.execution_status))
        ).sort();
        setUniqueStatuses(statuses as string[]);
      }
    } catch (error) {
      console.error("Error fetching unique values:", error);
    }
  };

  const fetchNodeExecutions = async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from("dt_node_executions")
        .select("*", { count: 'exact' });

      query = buildQuery(query);

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await query
        .order("inserted_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const rawData = (data as unknown) as RawNodeExecution[] | null;
      const processedData = processRawData(rawData || []);
      
      setNodeExecutions(processedData);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching node executions:", error);
      toast.error("Gagal memuat data eksekusi");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      let query = supabase.from("dt_node_executions").select("*");
      query = buildQuery(query);

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const rawData = (data as unknown) as RawNodeExecution[] | null;
        const processedData = processRawData(rawData || []);

        const totalNodes = processedData.length;
        const errorNodes = processedData.filter(n => n.has_error).length;
        const successNodes = processedData.filter(
          n => n.execution_status === "success"
        ).length;
        
        const totalTokens = processedData.reduce(
          (sum, n) => sum + (n.total_tokens || 0), 0
        );
        const totalPromptTokens = processedData.reduce(
          (sum, n) => sum + (n.prompt_tokens || 0), 0
        );
        const totalCompletionTokens = processedData.reduce(
          (sum, n) => sum + (n.completion_tokens || 0), 0
        );
        
        const totalTime = processedData.reduce(
          (sum, n) => sum + (n.execution_time_ms || 0), 0
        );
        const avgExecutionTime = totalNodes > 0 ? totalTime / totalNodes : 0;

        setMetrics({
          totalNodes,
          successNodes,
          errorNodes,
          totalTokens,
          avgExecutionTime,
          totalPromptTokens,
          totalCompletionTokens,
        });
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  const refetch = () => {
    fetchNodeExecutions();
    fetchMetrics();
    fetchUniqueValues();
  };

  useEffect(() => {
    fetchUniqueValues();
  }, []);

  useEffect(() => {
    fetchNodeExecutions();
    fetchMetrics();
  }, [currentPage, itemsPerPage, filters.debouncedSearchTerm, filters.statusFilter, filters.startDate, filters.endDate]);

  return {
    nodeExecutions,
    metrics,
    isLoading,
    totalCount,
    uniqueStatuses,
    refetch,
    buildQuery,
    processRawData
  };
};
// src/hooks/useAgentMonitoring.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { QueryWithDetails, QueryMonitoringFilters, QueryMonitoringKPI } from '@/types/agentMonitoring';
import { 
  fetchQueriesWithDetails, 
  fetchAllQueries,
  fetchKPIData // ✅ NEW: Import KPI service
} from '@/services/agentMonitoringService';
import { generateQueryCSV, downloadQueryCSV } from '@/utils/agentMonitoringUtils';
import { MONITORING_MESSAGES } from '@/constants/agentMonitoring';

export const useAgentMonitoring = (
  currentPage: number,
  itemsPerPage: number,
  filters: QueryMonitoringFilters
) => {
  const [queries, setQueries] = useState<QueryWithDetails[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [kpiData, setKpiData] = useState<QueryMonitoringKPI>({
    totalQueries: 0,
    successRate: 0,
    avgResponseTime: 0,
    totalWithRisks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingKPI, setIsLoadingKPI] = useState(true);

  const isFetchingRef = useRef(false);
  const isFetchingKPIRef = useRef(false);

  /**
   * Fetch table data
   */
  const fetchData = async () => {
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const { data, count } = await fetchQueriesWithDetails(
        currentPage,
        itemsPerPage,
        filters
      );

      setQueries(data);
      setTotalCount(count);

    } catch (error) {
      console.error("Error fetching queries:", error);
      toast.error(MONITORING_MESSAGES.ERROR_FETCH);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  /**
   * Fetch KPI data separately
   * ✅ NEW: Separate KPI calculation
   */
  const fetchKPI = async () => {
    if (isFetchingKPIRef.current) return;
    
    isFetchingKPIRef.current = true;
    setIsLoadingKPI(true);

    try {
      const kpi = await fetchKPIData(filters);
      setKpiData(kpi);
    } catch (error) {
      console.error("Error fetching KPI:", error);
      // Don't show error toast for KPI, just use default values
      setKpiData({
        totalQueries: 0,
        successRate: 0,
        avgResponseTime: 0,
        totalWithRisks: 0,
      });
    } finally {
      setIsLoadingKPI(false);
      isFetchingKPIRef.current = false;
    }
  };

  /**
   * Refresh both data and KPI
   */
  const refreshData = useCallback(() => {
    toast.info(MONITORING_MESSAGES.REFRESHING);
    fetchData();
    fetchKPI();
  }, []);

  /**
   * Download report
   */
  const downloadReport = useCallback(async () => {
    try {
      toast.info(MONITORING_MESSAGES.DOWNLOADING);

      const allQueries = await fetchAllQueries(filters);

      if (allQueries.length === 0) {
        toast.warning('Tidak ada data untuk diunduh');
        return;
      }

      const csvContent = generateQueryCSV(allQueries);
      downloadQueryCSV(csvContent);

      toast.success(MONITORING_MESSAGES.DOWNLOAD_SUCCESS(allQueries.length));
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error(MONITORING_MESSAGES.ERROR_DOWNLOAD);
    }
  }, [filters]);

  // Fetch table data when pagination or filters change
  useEffect(() => {
    fetchData();
    
    return () => {
      isFetchingRef.current = false;
    };
  }, [
    currentPage, 
    itemsPerPage, 
    filters.searchTerm,
    filters.statusFilter,
    filters.methodFilter,
    filters.riskFilter,
    filters.startDate,
    filters.endDate
  ]);

  // Fetch KPI when filters change (but NOT when page changes)
  useEffect(() => {
    fetchKPI();
    
    return () => {
      isFetchingKPIRef.current = false;
    };
  }, [
    filters.searchTerm,
    filters.statusFilter,
    filters.methodFilter,
    filters.riskFilter,
    filters.startDate,
    filters.endDate
    // ✅ Note: NO currentPage or itemsPerPage here!
  ]);

  return {
    queries,
    totalCount,
    kpiData,
    isLoading,
    isLoadingKPI, // ✅ NEW: Separate loading state for KPI
    refreshData,
    downloadReport,
  };
};
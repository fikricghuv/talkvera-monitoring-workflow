// src/hooks/useAgentOverview.ts

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type {
  AgentOverviewKPI,
  AgentTimeSeriesData,
  AgentMethodDistribution,
  AgentRiskDistribution,
  AgentTopUser,
  AgentOverviewFilters,
} from '@/types/dataAgent';
import { fetchOverviewData } from '@/services/dataAgentService';
import {
  calculateSuccessRate,
  calculateAverage,
  groupByDate,
  formatDate,
} from '@/utils/dataAgentUtils';
import { MESSAGES } from '@/constants/dataAgent';

/**
 * Main hook for agent overview data
 */
export const useAgentOverview = (filters: AgentOverviewFilters) => {
  const [kpiData, setKpiData] = useState<AgentOverviewKPI>({
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    avgResponseTime: 0,
    totalSQLQueries: 0,
    totalRAGQueries: 0,
    totalRisks: 0,
    highSeverityRisks: 0,
  });

  const [timeSeriesData, setTimeSeriesData] = useState<AgentTimeSeriesData[]>([]);
  const [methodDistribution, setMethodDistribution] = useState<AgentMethodDistribution[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<AgentRiskDistribution[]>([]);
  const [topUsers, setTopUsers] = useState<AgentTopUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔽 PERUBAHAN 1: Destrukturisasi filters untuk mendapatkan nilai primitif
  // Ini digunakan untuk menstabilkan dependensi di useCallback
  const { startDate, endDate, userFilter } = filters;

  /**
   * Calculate KPI data from raw data
   */
  const calculateKPI = useCallback((data: any) => {
    // ... (fungsi ini tidak berubah) ...
    const { queries, riskLogs } = data;

    const successfulQueries = queries.filter((q: any) => q.is_success).length;
    const failedQueries = queries.filter((q: any) => !q.is_success).length;
    
    const responseTimes = queries
      .filter((q: any) => q.response_time_ms !== null)
      .map((q: any) => q.response_time_ms);
    
    const avgResponseTime = calculateAverage(responseTimes);

    const totalSQLQueries = queries.filter((q: any) => q.used_sql).length;
    const totalRAGQueries = queries.filter((q: any) => q.used_rag).length;

    const highSeverityRisks = riskLogs.filter((r: any) => r.severity === 'high').length;

    return {
      totalQueries: queries.length,
      successfulQueries,
      failedQueries,
      avgResponseTime,
      totalSQLQueries,
      totalRAGQueries,
      totalRisks: riskLogs.length,
      highSeverityRisks,
    };
  }, []);

  /**
   * Calculate time series data
   */
  const calculateTimeSeries = useCallback((queries: any[], dateRange: { start: string; end: string }) => {
    // ... (fungsi ini tidak berubah) ...
    const grouped = groupByDate(queries, dateRange);
    
    const seriesData: AgentTimeSeriesData[] = [];
    
    grouped.forEach((items, date) => {
      const successful = items.filter(q => q.is_success).length;
      const failed = items.filter(q => !q.is_success).length;
      
      const responseTimes = items
        .filter(q => q.response_time_ms !== null)
        .map(q => q.response_time_ms);
      
      const avgResponseTime = calculateAverage(responseTimes);

      seriesData.push({
        date: formatDate(date, "dd MMM"),
        queries: items.length,
        successful,
        failed,
        avgResponseTime,
      });
    });

    return seriesData;
  }, []);

  /**
   * Calculate method distribution
   */
  const calculateMethodDistribution = useCallback((queries: any[]) => {
    // ... (fungsi ini tidak berubah) ...
    const sqlCount = queries.filter(q => q.used_sql && !q.used_rag).length;
    const ragCount = queries.filter(q => q.used_rag && !q.used_sql).length;
    const bothCount = queries.filter(q => q.used_sql && q.used_rag).length;
    const noneCount = queries.filter(q => !q.used_sql && !q.used_rag).length;

    const total = queries.length || 1;

    return [
      { method: 'SQL Only', count: sqlCount, percentage: (sqlCount / total) * 100 },
      { method: 'RAG Only', count: ragCount, percentage: (ragCount / total) * 100 },
      { method: 'SQL + RAG', count: bothCount, percentage: (bothCount / total) * 100 },
      { method: 'None', count: noneCount, percentage: (noneCount / total) * 100 },
    ].filter(item => item.count > 0);
  }, []);

  /**
   * Calculate risk distribution
   */
  const calculateRiskDistribution = useCallback((riskLogs: any[]) => {
    // ... (fungsi ini tidak berubah) ...
    const distribution = new Map<string, Map<string, number>>();

    riskLogs.forEach(risk => {
      if (!distribution.has(risk.risk_type)) {
        distribution.set(risk.risk_type, new Map());
      }
      const severityMap = distribution.get(risk.risk_type)!;
      severityMap.set(risk.severity, (severityMap.get(risk.severity) || 0) + 1);
    });

    const result: AgentRiskDistribution[] = [];
    distribution.forEach((severityMap, riskType) => {
      severityMap.forEach((count, severity) => {
        result.push({ risk_type: riskType, severity, count });
      });
    });

    return result.sort((a, b) => b.count - a.count);
  }, []);

  /**
   * Calculate top users
   */
  const calculateTopUsers = useCallback((queries: any[]) => {
    // ... (fungsi ini tidak berubah) ...
    const userMap = new Map<string, { total: number; successful: number }>();

    queries.forEach(query => {
      if (!userMap.has(query.user_id)) {
        userMap.set(query.user_id, { total: 0, successful: 0 });
      }
      const user = userMap.get(query.user_id)!;
      user.total++;
      if (query.is_success) user.successful++;
    });

    const users: AgentTopUser[] = [];
    userMap.forEach((stats, userId) => {
      users.push({
        user_id: userId,
        query_count: stats.total,
        success_rate: calculateSuccessRate(stats.successful, stats.total),
      });
    });

    return users.sort((a, b) => b.query_count - a.query_count).slice(0, 5);
  }, []);

  /**
   * Fetch and process all data
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      // 'filters' di sini merujuk ke 'filters' yang diterima oleh hook
      const data = await fetchOverviewData(filters);

      // Calculate KPI
      const kpi = calculateKPI(data);
      setKpiData(kpi);

      // Calculate time series
      const timeSeries = calculateTimeSeries(data.queries, {
        start: filters.startDate,
        end: filters.endDate,
      });
      setTimeSeriesData(timeSeries);

      // Calculate method distribution
      const methods = calculateMethodDistribution(data.queries);
      setMethodDistribution(methods);

      // Calculate risk distribution
      const risks = calculateRiskDistribution(data.riskLogs);
      setRiskDistribution(risks);

      // Calculate top users
      const users = calculateTopUsers(data.queries);
      setTopUsers(users);

    } catch (error) {
      console.error("Error fetching overview data:", error);
      toast.error(MESSAGES.ERROR_FETCH);
    } finally {
      setIsLoading(false);
    }
    // 🔽 PERUBAHAN 2: Ubah dependensi dari [filters, ...]
  }, [
      startDate, 
      endDate, 
      userFilter, 
    // 🔼 Menjadi nilai primitif
      calculateKPI, 
      calculateTimeSeries, 
      calculateMethodDistribution, 
      calculateRiskDistribution, 
      calculateTopUsers
    ]);

  /**
   * Refresh data
   */
  const refreshData = useCallback(() => {
    fetchData();
    toast.success(MESSAGES.SUCCESS_REFRESH);
  }, [fetchData]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Ini sekarang aman karena fetchData sudah stabil

  return {
    kpiData,
    timeSeriesData,
    methodDistribution,
    riskDistribution,
    topUsers,
    isLoading,
    refreshData,
  };
};
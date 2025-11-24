// src/hooks/useOperasionalBisnisOverview.ts

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type {
  OperasionalBisnisOverviewKPI,
  OperasionalBisnisTimeSeriesData,
  ToolCategoryDistribution,
  ToolOperationDistribution,
  TopTool,
  TopUser,
  OperasionalBisnisOverviewFilters,
} from '@/types/operasionalBisnisToolUsage';
import { fetchOperasionalBisnisOverviewData } from '@/services/operasionalBisnisToolUsageService';
import {
  calculateSuccessRate,
  groupByDate,
  formatDate,
  getUniqueValues,
} from '@/utils/operasionalBisnisToolUsageUtils';
import { MESSAGES } from '@/constants/operasionalBisnisToolUsage';

/**
 * Main hook for OperasionalBisnis overview data
 */
export const useOperasionalBisnisOverview = (filters: OperasionalBisnisOverviewFilters) => {
  const [kpiData, setKpiData] = useState<OperasionalBisnisOverviewKPI>({
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    totalUsers: 0,
    totalTransactions: 0,
    totalContentOps: 0,
    totalCRMOps: 0,
    uniqueTools: 0,
  });

  const [timeSeriesData, setTimeSeriesData] = useState<OperasionalBisnisTimeSeriesData[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<ToolCategoryDistribution[]>([]);
  const [operationDistribution, setOperationDistribution] = useState<ToolOperationDistribution[]>([]);
  const [topTools, setTopTools] = useState<TopTool[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { startDate, endDate, userFilter, categoryFilter } = filters;

  /**
   * Calculate KPI data
   */
  const calculateKPI = useCallback((data: any) => {
    const { toolUsage } = data;

    const successfulExecutions = toolUsage.filter((t: any) => t.success).length;
    const failedExecutions = toolUsage.filter((t: any) => !t.success).length;
    const uniqueUsers = getUniqueValues(toolUsage, 'user_id').size;
    const uniqueTools = getUniqueValues(toolUsage, 'tool_name').size;

    const totalTransactions = toolUsage.filter((t: any) => t.tool_category === 'transactions').length;
    const totalContentOps = toolUsage.filter((t: any) => t.tool_category === 'content').length;
    const totalCRMOps = toolUsage.filter((t: any) => t.tool_category === 'crm').length;

    return {
      totalExecutions: toolUsage.length,
      successfulExecutions,
      failedExecutions,
      totalUsers: uniqueUsers,
      totalTransactions,
      totalContentOps,
      totalCRMOps,
      uniqueTools,
    };
  }, []);

  /**
   * Calculate time series data
   */
  const calculateTimeSeries = useCallback((toolUsage: any[], dateRange: { start: string; end: string }) => {
    const grouped = groupByDate(toolUsage, dateRange);
    
    const seriesData: OperasionalBisnisTimeSeriesData[] = [];
    
    grouped.forEach((items, date) => {
      const successful = items.filter(t => t.success).length;
      const failed = items.filter(t => !t.success).length;

      seriesData.push({
        date: formatDate(date, "dd MMM"),
        executions: items.length,
        successful,
        failed,
      });
    });

    return seriesData;
  }, []);

  /**
   * Calculate category distribution
   */
  const calculateCategoryDistribution = useCallback((toolUsage: any[]) => {
    const transactions = toolUsage.filter(t => t.tool_category === 'transactions').length;
    const content = toolUsage.filter(t => t.tool_category === 'content').length;
    const crm = toolUsage.filter(t => t.tool_category === 'crm').length;
    const other = toolUsage.filter(t => !t.tool_category || !['transactions', 'content', 'crm'].includes(t.tool_category)).length;

    const total = toolUsage.length || 1;

    return [
      { category: 'Transactions', count: transactions, percentage: (transactions / total) * 100 },
      { category: 'Content', count: content, percentage: (content / total) * 100 },
      { category: 'CRM', count: crm, percentage: (crm / total) * 100 },
      { category: 'Other', count: other, percentage: (other / total) * 100 },
    ].filter(item => item.count > 0);
  }, []);

  /**
   * Calculate operation distribution
   */
  const calculateOperationDistribution = useCallback((toolUsage: any[]) => {
    const create = toolUsage.filter(t => t.tool_operation === 'create').length;
    const read = toolUsage.filter(t => t.tool_operation === 'read').length;
    const update = toolUsage.filter(t => t.tool_operation === 'update').length;
    const deleteOp = toolUsage.filter(t => t.tool_operation === 'delete').length;
    const other = toolUsage.filter(t => !t.tool_operation || !['create', 'read', 'update', 'delete'].includes(t.tool_operation)).length;

    const total = toolUsage.length || 1;

    return [
      { operation: 'Create', count: create, percentage: (create / total) * 100 },
      { operation: 'Read', count: read, percentage: (read / total) * 100 },
      { operation: 'Update', count: update, percentage: (update / total) * 100 },
      { operation: 'Delete', count: deleteOp, percentage: (deleteOp / total) * 100 },
      { operation: 'Other', count: other, percentage: (other / total) * 100 },
    ].filter(item => item.count > 0);
  }, []);

  /**
   * Calculate top tools
   */
  const calculateTopTools = useCallback((toolUsage: any[]) => {
    const toolMap = new Map<string, { total: number; successful: number }>();

    toolUsage.forEach(usage => {
      if (!toolMap.has(usage.tool_name)) {
        toolMap.set(usage.tool_name, { total: 0, successful: 0 });
      }
      const tool = toolMap.get(usage.tool_name)!;
      tool.total++;
      if (usage.success) tool.successful++;
    });

    const tools: TopTool[] = [];
    toolMap.forEach((stats, toolName) => {
      tools.push({
        tool_name: toolName,
        usage_count: stats.total,
        success_rate: calculateSuccessRate(stats.successful, stats.total),
      });
    });

    return tools.sort((a, b) => b.usage_count - a.usage_count).slice(0, 10);
  }, []);

  /**
   * Calculate top users
   */
  const calculateTopUsers = useCallback((toolUsage: any[]) => {
    const userMap = new Map<string, { name: string | null; total: number; successful: number }>();

    toolUsage.forEach(usage => {
      if (!userMap.has(usage.user_id)) {
        userMap.set(usage.user_id, { name: usage.user_name, total: 0, successful: 0 });
      }
      const user = userMap.get(usage.user_id)!;
      user.total++;
      if (usage.success) user.successful++;
    });

    const users: TopUser[] = [];
    userMap.forEach((stats, userId) => {
      users.push({
        user_id: userId,
        user_name: stats.name,
        execution_count: stats.total,
        success_rate: calculateSuccessRate(stats.successful, stats.total),
      });
    });

    return users.sort((a, b) => b.execution_count - a.execution_count).slice(0, 10);
  }, []);

  /**
   * Fetch and process all data
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const currentFilters: OperasionalBisnisOverviewFilters = {
        startDate,
        endDate,
        userFilter,
        categoryFilter,
      };

      const data = await fetchOperasionalBisnisOverviewData(currentFilters);

      const kpi = calculateKPI(data);
      setKpiData(kpi);

      const timeSeries = calculateTimeSeries(data.toolUsage, {
        start: startDate,
        end: endDate,
      });
      setTimeSeriesData(timeSeries);

      const categories = calculateCategoryDistribution(data.toolUsage);
      setCategoryDistribution(categories);

      const operations = calculateOperationDistribution(data.toolUsage);
      setOperationDistribution(operations);

      const tools = calculateTopTools(data.toolUsage);
      setTopTools(tools);

      const users = calculateTopUsers(data.toolUsage);
      setTopUsers(users);

    } catch (error) {
      console.error("Error fetching OperasionalBisnis overview data:", error);
      toast.error(MESSAGES.ERROR_FETCH);
    } finally {
      setIsLoading(false);
    }
  }, [
    startDate,
    endDate,
    userFilter,
    categoryFilter,
    calculateKPI,
    calculateTimeSeries,
    calculateCategoryDistribution,
    calculateOperationDistribution,
    calculateTopTools,
    calculateTopUsers
  ]);

  /**
   * Refresh data
   */
  const refreshData = useCallback(() => {
    fetchData();
    toast.success(MESSAGES.SUCCESS_REFRESH);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    kpiData,
    timeSeriesData,
    categoryDistribution,
    operationDistribution,
    topTools,
    topUsers,
    isLoading,
    refreshData,
  };
};
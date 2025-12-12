import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDashboardData = (periodFilter, customDates) => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getDateRange = () => {
    const now = new Date();
    let startDate;
    let endDate = new Date(now);

    if (periodFilter === "custom") {
      const startParts = customDates.start.split('-').map(Number);
      const endParts = customDates.end.split('-').map(Number);
      
      startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
      endDate = new Date(endParts[0], endParts[1] - 1, endParts[2]);
    } else {
      switch (periodFilter) {
        case "7days":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "3months":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "30days":
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const { startDate, endDate } = getDateRange();

    try {
      console.log("🔍 Fetching dashboard data with RPC...", { startDate, endDate });

      // Parallel fetch all RPC functions
      const [
        metricsResult,
        dailyExecutionsResult,
        topWorkflowsResult,
        costByDayResult,
        tokenUsageResult,
        workflowInfoResult
      ] = await Promise.all([
        supabase.rpc('get_dashboard_metrics', {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString()
        }),
        supabase.rpc('get_daily_executions', {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString()
        }),
        supabase.rpc('get_top_workflows', {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString(),
          p_limit: 5
        }),
        supabase.rpc('get_cost_by_day', {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString()
        }),
        supabase.rpc('get_token_usage_by_day', {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString()
        }),
        supabase
          .from("dt_workflow_information")
          .select("workflow_id, time_saved_per_execution")
      ]);

      // Check for errors
      if (metricsResult.error) throw metricsResult.error;
      if (dailyExecutionsResult.error) throw dailyExecutionsResult.error;
      if (topWorkflowsResult.error) throw topWorkflowsResult.error;
      if (costByDayResult.error) throw costByDayResult.error;
      if (tokenUsageResult.error) throw tokenUsageResult.error;

      console.log("✅ RPC Results:", {
        metrics: metricsResult.data,
        dailyExecutions: dailyExecutionsResult.data,
        topWorkflows: topWorkflowsResult.data,
        costByDay: costByDayResult.data,
        tokenUsage: tokenUsageResult.data
      });

      // Process metrics data
      const metricsData = metricsResult.data?.[0] || {};

      // Calculate total time saved
      let totalTimeSaved = 0;
      if (workflowInfoResult.data) {
        const timeSavedMap = new Map();
        workflowInfoResult.data.forEach((info) => {
          timeSavedMap.set(info.workflow_id, info.time_saved_per_execution || 0);
        });

        // Get successful workflows to calculate time saved
        const { data: successfulWorkflows } = await supabase
          .from("dt_workflow_executions")
          .select("workflow_id")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString())
          .or("status.eq.success,has_errors.eq.false");

        if (successfulWorkflows) {
          successfulWorkflows.forEach(execution => {
            const workflowId = execution.workflow_id;
            if (workflowId && timeSavedMap.has(workflowId)) {
              totalTimeSaved += timeSavedMap.get(workflowId) || 0;
            }
          });
        }
      }

      // Format the data
      setMetrics({
        workflows: {
          total: Number(metricsData.total_workflows) || 0,
          successful: Number(metricsData.successful_workflows) || 0,
          failed: Number(metricsData.failed_workflows) || 0,
          running: Number(metricsData.running_workflows) || 0,
          avgExecutionTime: Math.round(Number(metricsData.avg_execution_time) || 0),
          totalTimeExecution: Number(metricsData.total_execution_time) || 0,
          totalCost: Number(metricsData.total_cost) || 0,
          totalTokens: Number(metricsData.total_tokens) || 0,
          totalTimeSaved: totalTimeSaved,
        },
        trends: {
          dailyExecutions: dailyExecutionsResult.data || [],
          topWorkflows: (topWorkflowsResult.data || []).map(w => ({
            name: w.name,
            count: Number(w.count),
            successRate: Number(w.success_rate)
          })),
          costByDay: (costByDayResult.data || []).map(c => ({
            date: c.date,
            cost: parseFloat(Number(c.cost).toFixed(4))
          })),
          tokenUsage: tokenUsageResult.data || [],
        },
      });

      toast.success("Data dashboard berhasil dimuat via RPC");
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      toast.error("Gagal memuat data dashboard: " + error.message);
      
      // Fallback to legacy method if RPC fails
      console.log("🔄 Falling back to legacy method...");
      await fetchDashboardDataLegacy();
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy fallback method (same as original)
  const fetchDashboardDataLegacy = async () => {
    const { startDate, endDate } = getDateRange();

    try {
      const { data: workflowData, error: workflowError } = await supabase
        .from("dt_workflow_executions")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(10000); // Add limit for safety

      if (workflowError) throw workflowError;

      const { data: workflowInfoData, error: workflowInfoError } = await supabase
        .from("dt_workflow_information")
        .select("workflow_id, time_saved_per_execution");

      if (workflowInfoError) {
        console.error("Error fetching workflow info:", workflowInfoError);
      }

      const timeSavedMap = new Map();
      if (workflowInfoData && Array.isArray(workflowInfoData)) {
        workflowInfoData.forEach((info) => {
          timeSavedMap.set(info.workflow_id, info.time_saved_per_execution || 0);
        });
      }

      const successfulWorkflows = workflowData?.filter(w => w.status === "success" || !w.has_errors).length || 0;
      const failedWorkflows = workflowData?.filter(w => w.status === "error" || w.has_errors).length || 0;
      const runningWorkflows = workflowData?.filter(w => w.status === "running" || w.status === "waiting").length || 0;

      let totalTimeSaved = 0;
      workflowData?.forEach(execution => {
        const isSuccess = execution.status === "success" || !execution.has_errors;
        
        if (isSuccess) {
          const workflowId = execution.workflow_id;
          if (workflowId && timeSavedMap.has(workflowId)) {
            const timeSavedPerExecution = timeSavedMap.get(workflowId);
            totalTimeSaved += timeSavedPerExecution || 0;
          }
        }
      });
      
      const avgExecutionTime = workflowData?.length 
        ? workflowData.reduce((sum, w) => sum + (w.total_execution_time_ms || 0), 0) / workflowData.length 
        : 0;

      const totalTimeExecution = workflowData.reduce((sum, w) => sum + (w.total_execution_time_ms || 0), 0);
      const totalWorkflowCost = workflowData?.reduce((sum, w) => sum + (Number(w.estimated_cost_usd) || 0), 0) || 0;
      const totalWorkflowTokens = workflowData?.reduce((sum, w) => sum + (w.total_tokens || 0), 0) || 0;

      // Process daily executions, top workflows, cost, and tokens
      // (Same as original implementation)
      const dailyMap = new Map();
      workflowData?.forEach(w => {
        const date = new Date(w.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        const existing = dailyMap.get(date) || { count: 0, success: 0, failed: 0 };
        dailyMap.set(date, {
          count: existing.count + 1,
          success: existing.success + (w.status === "success" || !w.has_errors ? 1 : 0),
          failed: existing.failed + (w.has_errors ? 1 : 0),
        });
      });

      const dailyExecutions = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .slice(-14);

      const workflowMap = new Map();
      workflowData?.forEach(w => {
        const name = w.workflow_name || w.execution_id;
        const existing = workflowMap.get(name) || { count: 0, success: 0 };
        workflowMap.set(name, {
          count: existing.count + 1,
          success: existing.success + (w.status === "success" || !w.has_errors ? 1 : 0),
        });
      });

      const topWorkflows = Array.from(workflowMap.entries())
        .map(([name, data]) => ({
          name,
          count: data.count,
          successRate: data.count > 0 ? (data.success / data.count) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const costMap = new Map();
      workflowData?.forEach(w => {
        const date = new Date(w.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        const cost = Number(w.estimated_cost_usd) || 0;
        costMap.set(date, (costMap.get(date) || 0) + cost);
      });

      const costByDay = Array.from(costMap.entries())
        .map(([date, cost]) => ({ date, cost: parseFloat(cost.toFixed(4)) }))
        .slice(-14);

      const tokenMap = new Map();
      workflowData?.forEach(w => {
        const date = new Date(w.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        tokenMap.set(date, (tokenMap.get(date) || 0) + (w.total_tokens || 0));
      });

      const tokenUsage = Array.from(tokenMap.entries())
        .map(([date, tokens]) => ({ date, tokens }))
        .slice(-14);

      setMetrics({
        workflows: {
          total: workflowData?.length || 0,
          successful: successfulWorkflows,
          failed: failedWorkflows,
          running: runningWorkflows,
          avgExecutionTime: Math.round(avgExecutionTime),
          totalTimeExecution: totalTimeExecution,
          totalCost: totalWorkflowCost,
          totalTokens: totalWorkflowTokens,
          totalTimeSaved: totalTimeSaved,
        },
        trends: {
          dailyExecutions,
          topWorkflows,
          costByDay,
          tokenUsage,
        },
      });

      toast.warning("Menggunakan method legacy (max 10K data)");
    } catch (error) {
      console.error("Error in legacy fetch:", error);
      toast.error("Gagal memuat data dashboard");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [periodFilter, customDates]);

  return {
    metrics,
    isLoading,
    refetch: fetchDashboardData
  };
};
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDate } from "@/utils/dateUtils"

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
      const { data: workflowData, error: workflowError } = await supabase
        .from("dt_workflow_executions")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      if (workflowError) throw workflowError;

      const { data: workflowInfoData, error: workflowInfoError } = await supabase
        .from("dt_workflow_information" as any)
        .select("workflow_id, time_saved_per_execution") as any;

      if (workflowInfoError) {
        console.error("Error fetching workflow info:", workflowInfoError);
      }

      const timeSavedMap = new Map<string, number>();
      if (workflowInfoData && Array.isArray(workflowInfoData)) {
        workflowInfoData.forEach((info: any) => {
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
          const workflowId = (execution as any).workflow_id;
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

      const dailyMap = new Map();
      workflowData?.forEach(w => {
        const date = formatDate(new Date(w.created_at));
        const existing = dailyMap.get(date) || { count: 0, success: 0, failed: 0 };
        dailyMap.set(date, {
          count: existing.count + 1,
          success: existing.success + (w.status === "success" || !w.has_errors ? 1 : 0),
          failed: existing.failed + (w.has_errors ? 1 : 0),
        });
      });

      const dailyExecutions = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => {
          const [dayA, monthA] = a.date.split(' ');
          const [dayB, monthB] = b.date.split(' ');
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
          const monthIndexA = monthNames.indexOf(monthA);
          const monthIndexB = monthNames.indexOf(monthB);
          if (monthIndexA !== monthIndexB) return monthIndexA - monthIndexB;
          return parseInt(dayA) - parseInt(dayB);
        })
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
        const date = formatDate(new Date(w.created_at));
        const cost = Number(w.estimated_cost_usd) || 0;
        costMap.set(date, (costMap.get(date) || 0) + cost);
      });

      const costByDay = Array.from(costMap.entries())
        .map(([date, cost]) => ({ date, cost: parseFloat(cost.toFixed(4)) }))
        .sort((a, b) => {
          const [dayA, monthA] = a.date.split(' ');
          const [dayB, monthB] = b.date.split(' ');
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
          const monthIndexA = monthNames.indexOf(monthA);
          const monthIndexB = monthNames.indexOf(monthB);
          if (monthIndexA !== monthIndexB) return monthIndexA - monthIndexB;
          return parseInt(dayA) - parseInt(dayB);
        })
        .slice(-14);

      const tokenMap = new Map();
      workflowData?.forEach(w => {
        const date = formatDate(new Date(w.created_at));
        tokenMap.set(date, (tokenMap.get(date) || 0) + (w.total_tokens || 0));
      });

      const tokenUsage = Array.from(tokenMap.entries())
        .map(([date, tokens]) => ({ date, tokens }))
        .sort((a, b) => {
          const [dayA, monthA] = a.date.split(' ');
          const [dayB, monthB] = b.date.split(' ');
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
          const monthIndexA = monthNames.indexOf(monthA);
          const monthIndexB = monthNames.indexOf(monthB);
          if (monthIndexA !== monthIndexB) return monthIndexA - monthIndexB;
          return parseInt(dayA) - parseInt(dayB);
        })
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

      toast.success("Data dashboard berhasil dimuat");
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Gagal memuat data dashboard");
    } finally {
      setIsLoading(false);
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
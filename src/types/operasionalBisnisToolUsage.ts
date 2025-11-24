// src/types/OperasionalBisnisToolUsage.ts

export interface ToolUsage {
  id: string;
  execution_id: string;
  user_id: string;
  user_name: string | null;
  tool_name: string;
  tool_category: string | null;
  tool_operation: string | null;
  success: boolean;
  error_message: string | null;
  executed_at: string;
}

export interface OperasionalBisnisOverviewKPI {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  totalUsers: number;
  totalTransactions: number;
  totalContentOps: number;
  totalCRMOps: number;
  uniqueTools: number;
}

export interface OperasionalBisnisTimeSeriesData {
  date: string;
  executions: number;
  successful: number;
  failed: number;
}

export interface ToolCategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface ToolOperationDistribution {
  operation: string;
  count: number;
  percentage: number;
}

export interface TopTool {
  tool_name: string;
  usage_count: number;
  success_rate: number;
}

export interface TopUser {
  user_id: string;
  user_name: string | null;
  execution_count: number;
  success_rate: number;
}

export interface OperasionalBisnisOverviewFilters {
  startDate: string;
  endDate: string;
  userFilter: string;
  categoryFilter: string;
}
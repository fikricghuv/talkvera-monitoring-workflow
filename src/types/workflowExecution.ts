// types/workflowExecution.ts

export interface WorkflowExecution {
  execution_id: string;
  workflow_name: string | null;
  status: string;
  created_at: string;
  total_execution_time_ms: number | null;
  estimated_cost_usd: number;
  total_tokens: number;
  has_errors: boolean;
  error_node_name: string | null;
  error_message: string | null;
}

export interface RawExecutionData {
  execution_id: string;
  workflow_name: string | null;
  status: string;
  created_at: string;
  total_execution_time_ms: number | null;
  estimated_cost_usd: string | number;
  total_tokens: number;
  has_errors: boolean;
  error_node_name: string | null;
  error_message: string | null;
}

export interface NodeExecution {
  node_name: string;
  execution_index: number | null;
  model_name: string | null;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  execution_time_ms: number | null;
  has_error: boolean;
  error_message: string | null;
  execution_status: string | null;
  estimated_cost_usd: number;
}

export interface RawNodeExecution {
  node_name: string;
  execution_index: number | null;
  model_name: string | null;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  execution_time_ms: number | null;
  has_error: boolean;
  error_message: string | null;
  execution_status: string | null;
  estimated_cost_usd: string | number;
}

export interface KPIData {
  totalExecutions: number;
  failedExecutions: number;
  totalCost: number;
  totalTokens: number;
}

export interface FilterState {
  searchTerm: string;
  debouncedSearchTerm: string;
  statusFilter: string;
  startDate: string;
  endDate: string;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}
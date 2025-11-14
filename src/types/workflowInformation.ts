// types/workflowInformation.ts

export interface WorkflowInfo {
  workflow_id: string;
  name: string;
  active_status: boolean;
  created_at: string;
  updated_at: string | null;
  is_archived: boolean;
  time_saved_per_execution: number;
  total_nodes: number;
  error_workflow_call: string | null;
  inserted_at: string;
}

export interface KPIData {
  totalWorkflows: number;
  activeWorkflows: number;
  totalTimeSaved: number;
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
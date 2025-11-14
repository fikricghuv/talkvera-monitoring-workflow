export interface NodeExecution {
  id: string;
  execution_id: string;
  node_name: string;
  node_type: string | null;
  node_id: string | null;
  parent_node_name: string | null;
  
  execution_status: string | null;
  execution_time_ms: number | null;
  execution_index: number | null;
  sub_run_index: number | null;
  start_time: number | null;
  
  estimated_cost_usd: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_tokens: number | null;
  token_estimation_accuracy: number | null;
  
  has_error: boolean;
  error_message: string | null;
  error_name: string | null;
  error_stack: string | null;
  
  model_name: string | null;
  finish_reason: string | null;
  
  input_items_count: number;
  output_items_count: number;
  output_summary: string | null;
  
  source_nodes: any;
  node_parameters: any;
  prompt_messages: any;
  model_config: any;
  output_data_sample: any;
  
  inserted_at: string;
}

export interface RawNodeExecution extends Omit<NodeExecution, 'estimated_cost_usd' | 'token_estimation_accuracy'> {
  estimated_cost_usd: string | number;
  token_estimation_accuracy: string | number | null;
}

export interface MetricsData {
  totalNodes: number;
  successNodes: number;
  errorNodes: number;
  totalTokens: number;
  avgExecutionTime: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
}

export interface FilterState {
  searchTerm: string;
  debouncedSearchTerm: string;
  statusFilter: string;
  startDate: string;
  endDate: string;
}
// services/workflowExecutionService.ts

import { supabase } from "@/integrations/supabase/client";
import { 
  FilterState, 
  PaginationState, 
  WorkflowExecution, 
  RawExecutionData,
  NodeExecution,
  RawNodeExecution,
  KPIData 
} from "../types/workflowExecution";
import { EXECUTION_CONSTANTS } from "../constants/workflowExecution";
import { getDateRangeForFilter } from "../utils/workflowExecutionUtils";

/**
 * Query Builder Pattern untuk Supabase queries
 */
class ExecutionQueryBuilder {
  private query: any;

  constructor() {
    this.query = supabase.from(EXECUTION_CONSTANTS.TABLE_NAME);
  }

  select(columns: string, options?: any) {
    this.query = this.query.select(columns, options);
    return this;
  }

  applyFilters(filters: FilterState) {
    // Filter: search by workflow_name or execution_id
    if (filters.debouncedSearchTerm && filters.debouncedSearchTerm.length >= EXECUTION_CONSTANTS.MIN_SEARCH_LENGTH) {
      const searchFilter = `workflow_name.ilike.%${filters.debouncedSearchTerm}%,execution_id.ilike.%${filters.debouncedSearchTerm}%`;
      this.query = this.query.or(searchFilter);
    }

    // Filter: status
    if (filters.statusFilter !== "all") {
      this.query = this.query.eq("status", filters.statusFilter);
    }

    // Filter: date range
    if (filters.startDate) {
      this.query = this.query.gte("created_at", getDateRangeForFilter(filters.startDate, false));
    }
    if (filters.endDate) {
      this.query = this.query.lte("created_at", getDateRangeForFilter(filters.endDate, true));
    }

    return this;
  }

  orderBy(column: string, ascending: boolean = false) {
    this.query = this.query.order(column, { ascending });
    return this;
  }

  paginate(page: number, itemsPerPage: number) {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    this.query = this.query.range(from, to);
    return this;
  }

  async execute() {
    return await this.query;
  }
}

/**
 * Service untuk handle semua operasi data workflow execution
 */
export class WorkflowExecutionService {
  /**
   * Fetch executions dengan pagination dan filter
   */
  static async fetchExecutions(filters: FilterState, pagination: PaginationState) {
    const query = new ExecutionQueryBuilder()
      .select("execution_id, workflow_name, status, created_at, total_execution_time_ms, estimated_cost_usd, total_tokens, has_errors, error_node_name, error_message", { count: 'exact' })
      .applyFilters(filters)
      .orderBy("created_at")
      .paginate(pagination.currentPage, pagination.itemsPerPage);

    const { data, error, count } = await query.execute();

    if (error) throw error;

    const rawData = (data as unknown) as RawExecutionData[] | null;
    const safeRawData = rawData || [];

    const executions: WorkflowExecution[] = safeRawData.map((e) => ({
      execution_id: e.execution_id,
      workflow_name: e.workflow_name,
      status: e.status,
      created_at: e.created_at,
      total_execution_time_ms: e.total_execution_time_ms ? Number(e.total_execution_time_ms) : null,
      estimated_cost_usd: Number(e.estimated_cost_usd || 0),
      total_tokens: e.total_tokens || 0,
      has_errors: e.has_errors,
      error_node_name: e.error_node_name,
      error_message: e.error_message,
    }));

    return {
      executions,
      totalCount: count || 0,
    };
  }

  /**
   * Fetch KPI data (metrics)
   */
  static async fetchKPIData(filters: FilterState): Promise<KPIData> {
    const query = new ExecutionQueryBuilder()
      .select("*", { count: 'exact', head: false })
      .applyFilters(filters);

    const { data, error } = await query.execute();

    if (error) throw error;

    const rawData = (data as unknown) as RawExecutionData[] | null;
    const safeData = rawData || [];

    const totalCost = safeData.reduce((sum, e) => sum + Number(e.estimated_cost_usd || 0), 0);
    const totalTokens = safeData.reduce((sum, e) => sum + (e.total_tokens || 0), 0);
    const failedCount = safeData.filter(e => e.has_errors).length;

    return {
      totalExecutions: safeData.length,
      failedExecutions: failedCount,
      totalCost,
      totalTokens,
    };
  }

  /**
   * Export semua executions untuk CSV download
   */
  static async exportExecutions(filters: FilterState) {
    const query = new ExecutionQueryBuilder()
      .select("execution_id, workflow_name, status, created_at, total_execution_time_ms, estimated_cost_usd, total_tokens, has_errors, error_node_name, error_message")
      .applyFilters(filters)
      .orderBy("created_at");

    const { data, error } = await query.execute();

    if (error) throw error;

    const rawData = (data as unknown) as RawExecutionData[] | null;
    const safeRawData = rawData || [];

    const executions: WorkflowExecution[] = safeRawData.map((e) => ({
      execution_id: e.execution_id,
      workflow_name: e.workflow_name,
      status: e.status,
      created_at: e.created_at,
      total_execution_time_ms: e.total_execution_time_ms ? Number(e.total_execution_time_ms) : null,
      estimated_cost_usd: Number(e.estimated_cost_usd || 0),
      total_tokens: e.total_tokens || 0,
      has_errors: e.has_errors,
      error_node_name: e.error_node_name,
      error_message: e.error_message,
    }));

    return executions;
  }

  /**
   * Fetch node executions untuk detail modal
   */
  static async fetchNodeExecutions(executionId: string): Promise<NodeExecution[]> {
    const { data, error } = await supabase
      .from(EXECUTION_CONSTANTS.NODE_TABLE_NAME)
      .select("node_name, execution_index, model_name, total_tokens, prompt_tokens, completion_tokens, execution_time_ms, has_error, error_message, execution_status, estimated_cost_usd")
      .eq("execution_id", executionId)
      .order("execution_index", { ascending: true });

    if (error) throw error;

    const rawData = (data as unknown) as RawNodeExecution[] | null;
    const safeRawData = rawData || [];

    const nodeExecutions: NodeExecution[] = safeRawData.map((n) => ({
      node_name: n.node_name,
      execution_index: n.execution_index,
      model_name: n.model_name,
      total_tokens: n.total_tokens || 0,
      prompt_tokens: n.prompt_tokens || 0,
      completion_tokens: n.completion_tokens || 0,
      execution_time_ms: n.execution_time_ms ? Number(n.execution_time_ms) : null,
      has_error: n.has_error,
      error_message: n.error_message,
      execution_status: n.execution_status,
      estimated_cost_usd: Number(n.estimated_cost_usd || 0),
    }));

    return nodeExecutions;
  }
}
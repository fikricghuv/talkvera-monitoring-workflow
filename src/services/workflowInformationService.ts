// services/workflowInformationService.ts

import { supabase } from "@/integrations/supabase/client";
import { FilterState, PaginationState, WorkflowInfo, KPIData } from "@/types/workflowInformation";
import { WORKFLOW_CONSTANTS } from "@/constants/workflowInformation";
import { getDateRangeForFilter } from "@/utils/workflowInformationUtils";

// n8n Webhook Configuration
// FIX: Mengganti process.env (Node.js) yang menyebabkan error di browser.
// Jika menggunakan Vite, gunakan import.meta.env.VITE_... 
// Untuk saat ini kita gunakan fallback URL-nya langsung agar aplikasi tidak crash.
const n8nUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
/**
 * Query Builder Pattern untuk Supabase queries
 */
class WorkflowQueryBuilder {
  private query: any;

  constructor() {
    this.query = supabase.from(WORKFLOW_CONSTANTS.TABLE_NAME as any);
  }

  /**
   * Select columns dengan options
   */
  select(columns: string, options?: any) {
    this.query = this.query.select(columns, options);
    return this;
  }

  /**
   * Apply semua filter ke query
   */
  applyFilters(filters: FilterState) {
    // Filter: exclude archived workflows
    this.query = this.query.eq("is_archived", false);

    // Filter: search by name or workflow_id
    if (filters.debouncedSearchTerm && filters.debouncedSearchTerm.length >= WORKFLOW_CONSTANTS.MIN_SEARCH_LENGTH) {
      const searchFilter = `name.ilike.%${filters.debouncedSearchTerm}%,workflow_id.ilike.%${filters.debouncedSearchTerm}%`;
      this.query = this.query.or(searchFilter);
    }

    // Filter: active status
    if (filters.statusFilter === "active") {
      this.query = this.query.eq("active_status", true);
    } else if (filters.statusFilter === "inactive") {
      this.query = this.query.eq("active_status", false);
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

  /**
   * Order results by column
   */
  orderBy(column: string, ascending: boolean = false) {
    this.query = this.query.order(column, { ascending });
    return this;
  }

  /**
   * Apply pagination
   */
  paginate(page: number, itemsPerPage: number) {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    this.query = this.query.range(from, to);
    return this;
  }

  /**
   * Execute query
   */
  async execute() {
    return await this.query;
  }
}

/**
 * Service untuk handle semua operasi data workflow
 */
export class WorkflowInformationService {
  /**
   * Fetch workflows dengan pagination dan filter
   */
  static async fetchWorkflows(filters: FilterState, pagination: PaginationState) {
    const query = new WorkflowQueryBuilder()
      .select("*", { count: 'exact' })
      .applyFilters(filters)
      .orderBy("created_at")
      .paginate(pagination.currentPage, pagination.itemsPerPage);

    const { data, error, count } = await query.execute();

    if (error) throw error;

    return {
      workflows: (data || []) as WorkflowInfo[],
      totalCount: count || 0,
    };
  }

  /**
   * Fetch KPI data (metrics)
   */
  static async fetchKPIData(filters: FilterState): Promise<KPIData> {
    const query = new WorkflowQueryBuilder()
      .select("*", { count: 'exact', head: false })
      .applyFilters(filters);

    const { data, error } = await query.execute();

    if (error) throw error;

    const workflows = (data || []) as WorkflowInfo[];
    
    return {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(w => w.active_status).length,
      totalTimeSaved: workflows.reduce((sum, w) => sum + (w.time_saved_per_execution || 0), 0),
    };
  }

  /**
   * Export semua workflows untuk CSV download
   */
  static async exportWorkflows(filters: FilterState) {
    const query = new WorkflowQueryBuilder()
      .select("*")
      .applyFilters(filters)
      .orderBy("created_at");

    const { data, error } = await query.execute();

    if (error) throw error;

    return (data || []) as WorkflowInfo[];
  }

  /**
   * Trigger workflow processing via n8n webhook
   * Menjalankan proses yang sebelumnya berjalan via scheduled job
   */
  static async triggerWorkflowProcess(): Promise<void> {
    try {

      const response = await fetch(n8nUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trigger: "manual",
          timestamp: new Date().toISOString(),
          source: "workflow-information-ui",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Return response jika ada
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
    } catch (error) {
      console.error("Error triggering workflow process:", error);
      throw new Error(
        error instanceof Error 
          ? `Failed to trigger workflow process: ${error.message}`
          : "Failed to trigger workflow process: Unknown error"
      );
    }
  }
}
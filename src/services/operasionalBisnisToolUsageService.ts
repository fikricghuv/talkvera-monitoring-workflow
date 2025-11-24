// src/services/operasionalBisnisToolUsageService.ts

import { supabase } from "@/integrations/supabase/client";
import type { ToolUsage, OperasionalBisnisOverviewFilters } from "@/types/operasionalBisnisToolUsage";

/**
 * Apply date filters to query
 */
const applyDateFilters = (query: any, filters: OperasionalBisnisOverviewFilters): any => {
  if (filters.startDate) {
    const startDateTime = new Date(filters.startDate);
    startDateTime.setHours(0, 0, 0, 0);
    query = query.gte("executed_at", startDateTime.toISOString());
  }
  
  if (filters.endDate) {
    const endDateTime = new Date(filters.endDate);
    endDateTime.setHours(23, 59, 59, 999);
    query = query.lte("executed_at", endDateTime.toISOString());
  }
  
  return query;
};

/**
 * Fetch all tool usage data with filters
 */
export const fetchToolUsageData = async (
  filters: OperasionalBisnisOverviewFilters
): Promise<ToolUsage[]> => {
  console.log("🔍 Fetching with filters:", filters);
  
  let query = supabase
    .from("dt_agent_tool_usage" as any)
    .select("*")
    .order("executed_at", { ascending: false });

  query = applyDateFilters(query, filters);

  if (filters.userFilter) {
    query = query.ilike("user_id", `%${filters.userFilter}%`);
  }

  if (filters.categoryFilter) {
    query = query.eq("tool_category", filters.categoryFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ Supabase Error:", error);
    throw new Error(error.message);
  }

  console.log("✅ Fetched data count:", data?.length || 0);
  console.log("📊 Sample data:", data?.slice(0, 3));
  
  // Log duplicate execution_ids for debugging
  if (data && data.length > 0) {
    const executionIds = data.map((item: any) => item.execution_id);
    const duplicates = executionIds.filter((id: string, index: number) => 
      executionIds.indexOf(id) !== index
    );
    if (duplicates.length > 0) {
      console.log("🔄 Found duplicate execution_ids:", new Set(duplicates));
    }
  }

  return (data as unknown as ToolUsage[]) || [];
};

/**
 * Fetch complete overview data
 */
export const fetchOperasionalBisnisOverviewData = async (
  filters: OperasionalBisnisOverviewFilters
): Promise<{
  toolUsage: ToolUsage[];
}> => {
  const toolUsage = await fetchToolUsageData(filters);

  return {
    toolUsage,
  };
};
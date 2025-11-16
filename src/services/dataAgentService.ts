// src/services/agentService.ts

import { supabase } from "@/integrations/supabase/client";
import type { AgentQuery, AgentSQLLog, AgentRAGLog, AgentRiskLog, AgentOverviewFilters } from "@/types/dataAgent";

/**
 * Apply date filters to query
 */
const applyDateFilters = (query: any, filters: AgentOverviewFilters): any => {
  if (filters.startDate) {
    const startDateTime = new Date(filters.startDate);
    startDateTime.setHours(0, 0, 0, 0);
    query = query.gte("created_at", startDateTime.toISOString());
  }
  
  if (filters.endDate) {
    const endDateTime = new Date(filters.endDate);
    endDateTime.setHours(23, 59, 59, 999);
    query = query.lte("created_at", endDateTime.toISOString());
  }
  
  return query;
};

/**
 * Fetch all agent queries with filters
 */
export const fetchAgentQueries = async (
  filters: AgentOverviewFilters
): Promise<AgentQuery[]> => {
  let query = supabase
    .from("dt_agent_queries" as any) 
    .select("*")
    .order("created_at", { ascending: false });

  query = applyDateFilters(query, filters);

  if (filters.userFilter) {
    query = query.ilike("user_id", `%${filters.userFilter}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  // DIUBAH DI SINI
  return (data as unknown as AgentQuery[]) || [];
};

/**
 * Fetch SQL logs for queries
 */
export const fetchSQLLogs = async (
  queryIds: string[]
): Promise<AgentSQLLog[]> => {
  if (queryIds.length === 0) return [];

  const { data, error } = await supabase
    .from("dt_agent_sql_logs" as any) 
    .select("*")
    .in("agent_query_id", queryIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // DIUBAH DI SINI
  return (data as unknown as AgentSQLLog[]) || [];
};

/**
 * Fetch RAG logs for queries
 */
export const fetchRAGLogs = async (
  queryIds: string[]
): Promise<AgentRAGLog[]> => {
  if (queryIds.length === 0) return [];

  const { data, error } = await supabase
    .from("dt_agent_rag_logs" as any) 
    .select("*")
    .in("agent_query_id", queryIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // DIUBAH DI SINI
  return (data as unknown as AgentRAGLog[]) || [];
};

/**
 * Fetch risk logs with filters
 */
export const fetchRiskLogs = async (
  filters: AgentOverviewFilters
): Promise<AgentRiskLog[]> => {
  let query = supabase
    .from("dt_agent_risk_logs" as any) 
    .select("*")
    .order("created_at", { ascending: false });

  query = applyDateFilters(query, filters);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  // DIUBAH DI SINI
  return (data as unknown as AgentRiskLog[]) || [];
};

/**
 * Fetch complete overview data
 */
export const fetchOverviewData = async (
  filters: AgentOverviewFilters
): Promise<{
  queries: AgentQuery[];
  sqlLogs: AgentSQLLog[];
  ragLogs: AgentRAGLog[];
  riskLogs: AgentRiskLog[];
}> => {
  // Fetch queries
  const queries = await fetchAgentQueries(filters);
  
  // Get query IDs for related data
  const queryIds = queries.map(q => q.id);
  
  // Fetch related data in parallel
  const [sqlLogs, ragLogs, riskLogs] = await Promise.all([
    fetchSQLLogs(queryIds),
    fetchRAGLogs(queryIds),
    fetchRiskLogs(filters),
  ]);

  return {
    queries,
    sqlLogs,
    ragLogs,
    riskLogs,
  };
};
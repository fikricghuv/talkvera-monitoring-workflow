// src/services/agentMonitoringService.ts

import { supabase } from "@/integrations/supabase/client";
import type { QueryMonitoringFilters, QueryWithDetails } from "@/types/agentMonitoring";
import type { AgentQuery, AgentSQLLog, AgentRAGLog, AgentRiskLog } from "@/types/dataAgentOverview";

/**
 * Apply filters to query
 */
const applyFilters = (query: any, filters: QueryMonitoringFilters): any => {
  // Search filter
  if (filters.searchTerm && filters.searchTerm.length >= 3) {
    query = query.or(`question.ilike.%${filters.searchTerm}%,user_id.ilike.%${filters.searchTerm}%,agent_response.ilike.%${filters.searchTerm}%`);
  }

  // Status filter
  if (filters.statusFilter === 'success') {
    query = query.eq('is_success', true);
  } else if (filters.statusFilter === 'failed') {
    query = query.eq('is_success', false);
  }

  // Method filter
  if (filters.methodFilter === 'sql') {
    query = query.eq('used_sql', true).eq('used_rag', false);
  } else if (filters.methodFilter === 'rag') {
    query = query.eq('used_sql', false).eq('used_rag', true);
  } else if (filters.methodFilter === 'both') {
    query = query.eq('used_sql', true).eq('used_rag', true);
  } else if (filters.methodFilter === 'none') {
    query = query.eq('used_sql', false).eq('used_rag', false);
  }

  // Date filters
  if (filters.startDate) {
    const startDateTime = new Date(filters.startDate);
    startDateTime.setHours(0, 0, 0, 0);
    query = query.gte('created_at', startDateTime.toISOString());
  }

  if (filters.endDate) {
    const endDateTime = new Date(filters.endDate);
    endDateTime.setHours(23, 59, 59, 999);
    query = query.lte('created_at', endDateTime.toISOString());
  }

  return query;
};

/**
 * Fetch queries with pagination and filters
 */
export const fetchQueries = async (
  page: number,
  limit: number,
  filters: QueryMonitoringFilters
): Promise<{ data: AgentQuery[]; count: number }> => {
  let query = supabase
    .from('dt_agent_queries')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  query = applyFilters(query, filters);

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: (data as AgentQuery[]) || [],
    count: count || 0,
  };
};

/**
 * Fetch related logs for queries
 */
export const fetchRelatedLogs = async (
  queryIds: string[]
): Promise<{
  sqlLogs: AgentSQLLog[];
  ragLogs: AgentRAGLog[];
  riskLogs: AgentRiskLog[];
}> => {
  if (queryIds.length === 0) {
    return { sqlLogs: [], ragLogs: [], riskLogs: [] };
  }

  const [sqlResult, ragResult, riskResult] = await Promise.all([
    supabase
      .from('dt_agent_sql_logs')
      .select('*')
      .in('agent_query_id', queryIds),
    supabase
      .from('dt_agent_rag_logs')
      .select('*')
      .in('agent_query_id', queryIds),
    supabase
      .from('dt_agent_risk_logs')
      .select('*')
      .in('agent_query_id', queryIds),
  ]);

  if (sqlResult.error) throw new Error(sqlResult.error.message);
  if (ragResult.error) throw new Error(ragResult.error.message);
  if (riskResult.error) throw new Error(riskResult.error.message);

  return {
    sqlLogs: (sqlResult.data as AgentSQLLog[]) || [],
    ragLogs: (ragResult.data as AgentRAGLog[]) || [],
    riskLogs: (riskResult.data as AgentRiskLog[]) || [],
  };
};

/**
 * Fetch queries with all related data
 * FIXED: Handle risk filter properly for pagination
 */
export const fetchQueriesWithDetails = async (
  page: number,
  limit: number,
  filters: QueryMonitoringFilters
): Promise<{ data: QueryWithDetails[]; count: number }> => {
  
  // OPTION 1: If risk filter is active, fetch ALL data then paginate client-side
  // This ensures accurate pagination but can be slow with large datasets
  if (filters.riskFilter !== 'all') {
    // Fetch all queries without pagination
    let query = supabase
      .from('dt_agent_queries')
      .select('*')
      .order('created_at', { ascending: false });

    query = applyFilters(query, filters);

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const queries = (data as AgentQuery[]) || [];
    const queryIds = queries.map(q => q.id);
    const { sqlLogs, ragLogs, riskLogs } = await fetchRelatedLogs(queryIds);

    // Combine data
    const queriesWithDetails: QueryWithDetails[] = queries.map(query => ({
      ...query,
      sql_logs: sqlLogs.filter(s => s.agent_query_id === query.id),
      rag_logs: ragLogs.filter(r => r.agent_query_id === query.id),
      risk_logs: riskLogs.filter(r => r.agent_query_id === query.id),
    }));

    // Apply risk filter
    let filteredQueries = queriesWithDetails;
    if (filters.riskFilter === 'with_risk') {
      filteredQueries = queriesWithDetails.filter(q => q.risk_logs.length > 0);
    } else if (filters.riskFilter === 'no_risk') {
      filteredQueries = queriesWithDetails.filter(q => q.risk_logs.length === 0);
    }

    // Apply pagination client-side
    const totalCount = filteredQueries.length;
    const from = (page - 1) * limit;
    const to = from + limit;
    const paginatedData = filteredQueries.slice(from, to);

    return {
      data: paginatedData,
      count: totalCount,
    };
  }

  // OPTION 2: Normal flow without risk filter (server-side pagination)
  const { data: queries, count } = await fetchQueries(page, limit, filters);
  const queryIds = queries.map(q => q.id);
  const { sqlLogs, ragLogs, riskLogs } = await fetchRelatedLogs(queryIds);

  const queriesWithDetails: QueryWithDetails[] = queries.map(query => ({
    ...query,
    sql_logs: sqlLogs.filter(s => s.agent_query_id === query.id),
    rag_logs: ragLogs.filter(r => r.agent_query_id === query.id),
    risk_logs: riskLogs.filter(r => r.agent_query_id === query.id),
  }));

  return {
    data: queriesWithDetails,
    count: count,
  };
};

/**
 * Fetch all queries for export
 */
export const fetchAllQueries = async (
  filters: QueryMonitoringFilters
): Promise<QueryWithDetails[]> => {
  let query = supabase
    .from('dt_agent_queries')
    .select('*')
    .order('created_at', { ascending: false });

  query = applyFilters(query, filters);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const queries = (data as AgentQuery[]) || [];
  const queryIds = queries.map(q => q.id);
  const { sqlLogs, ragLogs, riskLogs } = await fetchRelatedLogs(queryIds);

  const queriesWithDetails: QueryWithDetails[] = queries.map(query => ({
    ...query,
    sql_logs: sqlLogs.filter(s => s.agent_query_id === query.id),
    rag_logs: ragLogs.filter(r => r.agent_query_id === query.id),
    risk_logs: riskLogs.filter(r => r.agent_query_id === query.id),
  }));

  // Apply risk filter
  if (filters.riskFilter === 'with_risk') {
    return queriesWithDetails.filter(q => q.risk_logs.length > 0);
  } else if (filters.riskFilter === 'no_risk') {
    return queriesWithDetails.filter(q => q.risk_logs.length === 0);
  }

  return queriesWithDetails;
};

/**
 * Fetch KPI data separately (aggregate queries)
 * This calculates KPI from ALL filtered data, not just current page
 */
export const fetchKPIData = async (
  filters: QueryMonitoringFilters
): Promise<QueryMonitoringKPI> => {
  // Build filtered query (without pagination)
  let query = supabase
    .from('dt_agent_queries')
    .select('id, is_success, response_time_ms, created_at');

  query = applyFilters(query, filters);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const queries = data || [];

  // Calculate basic metrics
  const totalQueries = queries.length;
  const successfulQueries = queries.filter(q => q.is_success).length;
  const successRate = totalQueries > 0 
    ? (successfulQueries / totalQueries) * 100 
    : 0;

  // Calculate average response time
  const responseTimes = queries
    .filter(q => q.response_time_ms !== null)
    .map(q => q.response_time_ms!);
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    : 0;

  // Fetch risk data if needed
  let totalWithRisks = 0;
  if (totalQueries > 0 && filters.riskFilter !== 'no_risk') {
    const queryIds = queries.map(q => q.id);
    
    // Count unique queries with risks
    const { data: riskData, error: riskError } = await supabase
      .from('dt_agent_risk_logs')
      .select('agent_query_id')
      .in('agent_query_id', queryIds);

    if (!riskError && riskData) {
      const uniqueQueryIdsWithRisks = new Set(riskData.map(r => r.agent_query_id));
      totalWithRisks = uniqueQueryIdsWithRisks.size;
    }
  }

  return {
    totalQueries,
    successRate: Math.round(successRate * 100) / 100, // Round to 2 decimals
    avgResponseTime: Math.round(avgResponseTime * 100) / 100,
    totalWithRisks,
  };
};
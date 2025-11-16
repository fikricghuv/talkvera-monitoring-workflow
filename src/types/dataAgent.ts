// src/types/agent.ts

export interface AgentQuery {
  id: string;
  user_id: string;
  question: string;
  agent_response: string | null;
  is_success: boolean;
  response_time_ms: number | null;
  used_sql: boolean;
  used_rag: boolean;
  created_at: string;
}

export interface AgentSQLLog {
  id: string;
  agent_query_id: string;
  sql_raw: string;
  execution_time_ms: number | null;
  status: 'success' | 'error';
  error_message: string | null;
  created_at: string;
}

export interface AgentRAGLog {
  id: string;
  agent_query_id: string;
  vector_query: string | null;
  top_k: number;
  retrieval_count: number | null;
  rag_latency_ms: number | null;
  created_at: string;
}

export interface AgentRiskLog {
  id: string;
  agent_query_id: string;
  risk_type: 'injection' | 'restricted_table' | 'destructive_query' | 'anomaly';
  severity: 'low' | 'medium' | 'high';
  detail: Record<string, any>;
  created_at: string;
}

export interface AgentOverviewKPI {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  avgResponseTime: number;
  totalSQLQueries: number;
  totalRAGQueries: number;
  totalRisks: number;
  highSeverityRisks: number;
}

export interface AgentTimeSeriesData {
  date: string;
  queries: number;
  successful: number;
  failed: number;
  avgResponseTime: number;
}

export interface AgentMethodDistribution {
  method: string;
  count: number;
  percentage: number;
}

export interface AgentRiskDistribution {
  risk_type: string;
  severity: string;
  count: number;
}

export interface AgentTopUser {
  user_id: string;
  query_count: number;
  success_rate: number;
}

export interface AgentOverviewFilters {
  startDate: string;
  endDate: string;
  userFilter: string;
}
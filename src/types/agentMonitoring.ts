// src/types/agentMonitoring.ts

import type { AgentQuery, AgentSQLLog, AgentRAGLog, AgentRiskLog } from './dataAgent';

export interface QueryWithDetails extends AgentQuery {
  sql_logs: AgentSQLLog[];
  rag_logs: AgentRAGLog[];
  risk_logs: AgentRiskLog[];
}

export interface QueryMonitoringFilters {
  searchTerm: string;
  statusFilter: string; // 'all', 'success', 'failed'
  methodFilter: string; // 'all', 'sql', 'rag', 'both', 'none'
  riskFilter: string; // 'all', 'with_risk', 'no_risk'
  startDate: string;
  endDate: string;
}

export interface QueryMonitoringKPI {
  totalQueries: number;
  successRate: number;
  avgResponseTime: number;
  totalWithRisks: number;
}
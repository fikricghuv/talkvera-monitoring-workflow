// src/constants/agent.ts

export const AGENT_CONSTANTS = {
  DEFAULT_TIME_RANGE: 7, // days
  CHART_COLORS: {
    primary: '#3b82f6',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#06b6d4',
  },
  RISK_COLORS: {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
  },
} as const;

export const RISK_TYPE_LABELS: Record<string, string> = {
  injection: 'SQL Injection',
  restricted_table: 'Restricted Table Access',
  destructive_query: 'Destructive Query',
  anomaly: 'Anomaly Detected',
};

export const SEVERITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200',
};

export const MESSAGES = {
  LOADING: 'Memuat data...',
  NO_DATA: 'Belum ada data agent query',
  ERROR_FETCH: 'Gagal memuat data overview',
  ERROR_GENERIC: 'Terjadi kesalahan saat memuat data',
  SUCCESS_REFRESH: 'Data berhasil dimuat ulang',
} as const;
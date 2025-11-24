// src/constants/n8nToolUsage.ts

export const OPS_CONSTANTS = {
  CHART_COLORS: {
    primary: '#3b82f6',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#8b5cf6',
    transactions: '#06b6d4',
    content: '#f59e0b',
    crm: '#8b5cf6',
  },
  CATEGORIES: {
    TRANSACTIONS: 'transactions',
    CONTENT: 'content',
    CRM: 'crm',
  },
  OPERATIONS: {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
  },
};

export const MESSAGES = {
  ERROR_FETCH: 'Gagal memuat data tool usage',
  SUCCESS_REFRESH: 'Data berhasil di-refresh',
};
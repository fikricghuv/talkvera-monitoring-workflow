// src/constants/agentMonitoring.ts

export const MONITORING_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100] as const,
  DEBOUNCE_DELAY: 500,
  MIN_SEARCH_LENGTH: 3,
  MAX_VISIBLE_PAGES: 5,
} as const;

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'success', label: 'Success Only' },
  { value: 'failed', label: 'Failed Only' },
] as const;

export const METHOD_FILTER_OPTIONS = [
  { value: 'all', label: 'All Methods' },
  { value: 'sql', label: 'SQL Only' },
  { value: 'rag', label: 'RAG Only' },
  { value: 'both', label: 'SQL + RAG' },
  { value: 'none', label: 'None' },
] as const;

export const RISK_FILTER_OPTIONS = [
  { value: 'all', label: 'All Queries' },
  { value: 'with_risk', label: 'With Risk' },
  { value: 'no_risk', label: 'No Risk' },
] as const;

export const TABLE_COLUMNS = {
  QUESTION: 'Question',
  USER: 'User ID',
  STATUS: 'Status',
  METHOD: 'Method',
  RESPONSE_TIME: 'Response Time',
  RISKS: 'Risks',
  CREATED_AT: 'Created At',
} as const;

export const MONITORING_MESSAGES = {
  LOADING: 'Memuat data queries...',
  REFRESHING: 'Memuat ulang data...',
  DOWNLOADING: 'Mengunduh report...',
  NO_DATA: 'Belum ada query',
  NO_FILTERED_DATA: 'Tidak ada query yang sesuai dengan filter',
  ERROR_FETCH: 'Gagal memuat data queries',
  ERROR_DOWNLOAD: 'Gagal mengunduh report',
  DOWNLOAD_SUCCESS: (count: number) => `Report berhasil diunduh (${count} baris)`,
} as const;
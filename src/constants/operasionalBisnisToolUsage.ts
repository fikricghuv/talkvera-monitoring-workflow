// src/constants/operasionalBisnisToolUsage.ts

export const OPS_CONSTANTS = {
  CHART_COLORS: {
    primary: '#3b82f6',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#06b6d4',
    purple: '#8b5cf6',
    indigo: '#6366f1',
    pink: '#ec4899',
    teal: '#14b8a6',
    orange: '#f97316',
  },

  SOURCE_COLORS: {
    landing_page: '#3b82f6',
    whatsapp: '#10b981',
    manual: '#6b7280',
  },

  LIFECYCLE_COLORS: {
    lead: '#f59e0b',
    qualified: '#06b6d4',
    customer: '#10b981',
    inactive: '#6b7280',
  },

  LEAD_STATUS_COLORS: {
    new: '#3b82f6',
    in_progress: '#f59e0b',
    follow_up: '#8b5cf6',
    closed_won: '#10b981',
    closed_lost: '#ef4444',
  },

  SESSION_STATUS_COLORS: {
    IN_PROGRESS: '#f59e0b',
    COMPLETED: '#10b981',
    ABANDONED: '#ef4444',
  },

  APPOINTMENT_STATUS_COLORS: {
    scheduled: '#3b82f6',
    completed: '#10b981',
    canceled: '#ef4444',
    rescheduled: '#f59e0b',
  },
};

export const MESSAGES = {
  ERROR_FETCH: 'Gagal mengambil data operasional bisnis',
  SUCCESS_REFRESH: 'Data berhasil di-refresh',
  ERROR_NETWORK: 'Terjadi kesalahan jaringan',
  NO_DATA: 'Tidak ada data tersedia untuk periode ini',
  SUCCESS_EXPORT: 'Data berhasil di-export',
  ERROR_EXPORT: 'Gagal mengekspor data',
};

export const SOURCE_FILTERS = [
  { value: 'all', label: 'Semua Source' },
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'manual', label: 'Manual Entry' },
];

export const LIFECYCLE_STAGES = [
  { value: '', label: 'Semua Lifecycle Stage' },
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'customer', label: 'Customer' },
  { value: 'inactive', label: 'Inactive' },
];

export const LEAD_STATUSES = [
  { value: '', label: 'Semua Lead Status' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
];

export const SESSION_STATUSES = [
  { value: '', label: 'Semua Status Session' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ABANDONED', label: 'Abandoned' },
];

export const APPOINTMENT_STATUSES = [
  { value: '', label: 'Semua Status Appointment' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'rescheduled', label: 'Rescheduled' },
];

// Default values
export const DEFAULT_LEAD_SCORE = 0;
export const DEFAULT_LIFECYCLE_STAGE = 'lead';
export const DEFAULT_LEAD_STATUS = 'new';
export const DEFAULT_SESSION_STATUS = 'IN_PROGRESS';
export const DEFAULT_APPOINTMENT_STATUS = 'scheduled';

// Thresholds
export const HIGH_LEAD_SCORE_THRESHOLD = 70;
export const MEDIUM_LEAD_SCORE_THRESHOLD = 40;
export const SESSION_TIMEOUT_MINUTES = 30;
export const IDEAL_RESPONSE_TIME_MINUTES = 5;
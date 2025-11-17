// src/utils/agentMonitoringUtils.ts - Complete Utility Functions

import type { QueryWithDetails } from '@/types/agentMonitoring';
import { format } from 'date-fns';

// ============================================
// CSV EXPORT FUNCTIONS
// ============================================

/**
 * Safely get nested property with fallback
 */
const safeGet = (obj: any, path: string, fallback: string = '-'): string => {
  const value = path.split('.').reduce((acc, part) => acc?.[part], obj);
  return value !== null && value !== undefined ? String(value) : fallback;
};

/**
 * Escape CSV values (handle quotes and commas)
 */
const escapeCsvValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  const strValue = String(value);
  // Wrap in quotes if contains comma, quote, or newline
  if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
    return `"${strValue.replace(/"/g, '""')}"`;
  }
  return strValue;
};

/**
 * Format risk logs to readable string
 */
const formatRiskLogs = (riskLogs: any[]): string => {
  if (!riskLogs || riskLogs.length === 0) return '-';
  
  return riskLogs.map((risk, index) => {
    // Try different possible property names for risk type and message
    const type = risk.risk_type || risk.type || risk.riskType || 'Unknown';
    const message = 
      risk.risk_message || 
      risk.message || 
      risk.description || 
      risk.details || 
      'No details available';
    
    return `Risk ${index + 1} - ${type}: ${message}`;
  }).join('; ');
};

/**
 * Format date safely
 */
const formatDateSafe = (dateValue: any): string => {
  if (!dateValue) return '-';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return String(dateValue);
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  } catch {
    return String(dateValue);
  }
};

/**
 * Generate CSV content from queries
 */
export const generateQueryCSV = (queries: QueryWithDetails[]): string => {
  // CSV Headers
  const headers = [
    'ID',
    'Question',
    'User ID',
    'Status',
    'Used SQL',
    'Used RAG',
    'Response Time (ms)',
    'Agent Response',
    'Number of Risks',
    'Risk Details',
    'SQL Queries Count',
    'RAG Queries Count',
    'Created At'
  ];

  // Build CSV rows
  const rows = queries.map(query => {
    const riskDetails = formatRiskLogs(query.risk_logs);

    return [
      escapeCsvValue(query.id),
      escapeCsvValue(query.question || 'No question'),
      escapeCsvValue(query.user_id || 'Unknown'),
      query.is_success ? 'Success' : 'Failed',
      query.used_sql ? 'Yes' : 'No',
      query.used_rag ? 'Yes' : 'No',
      query.response_time_ms || 0,
      escapeCsvValue(query.agent_response || 'No response'),
      query.risk_logs?.length || 0,
      escapeCsvValue(riskDetails),
      query.sql_logs?.length || 0,
      query.rag_logs?.length || 0,
      formatDateSafe(query.created_at)
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Download CSV file
 */
export const downloadQueryCSV = (csvContent: string, filename?: string): void => {
  // Default filename with timestamp
  const defaultFilename = `agent_queries_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`;
  const finalFilename = filename || defaultFilename;

  // Create blob with UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', finalFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// ============================================
// TABLE DISPLAY FUNCTIONS
// ============================================

/**
 * Get method label for display
 */
export const getMethodLabel = (usedSql: boolean, usedRag: boolean): string => {
  if (usedSql && usedRag) return 'SQL + RAG';
  if (usedSql) return 'SQL';
  if (usedRag) return 'RAG';
  return 'None';
};

/**
 * Get method badge CSS class
 */
export const getMethodBadgeClass = (usedSql: boolean, usedRag: boolean): string => {
  if (usedSql && usedRag) return 'border-purple-500 text-purple-700';
  if (usedSql) return 'border-blue-500 text-blue-700';
  if (usedRag) return 'border-orange-500 text-orange-700';
  return 'border-gray-400 text-gray-600';
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string | null | undefined, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format date for table display
 */
export const formatTableDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
  } catch {
    return String(dateString);
  }
};

// ============================================
// DETAIL MODAL FUNCTIONS
// ============================================

/**
 * Format date for detail modal (more detailed format)
 */
export const formatDetailDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm:ss');
  } catch {
    return String(dateString);
  }
};

/**
 * Format SQL query for display (with line breaks)
 */
export const formatSQLQuery = (sql: string | null | undefined): string => {
  if (!sql) return 'No SQL query';
  // Basic SQL formatting - add line breaks for readability
  return sql
    .replace(/\bSELECT\b/gi, '\nSELECT')
    .replace(/\bFROM\b/gi, '\nFROM')
    .replace(/\bWHERE\b/gi, '\nWHERE')
    .replace(/\bJOIN\b/gi, '\nJOIN')
    .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN')
    .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN')
    .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
    .replace(/\bORDER BY\b/gi, '\nORDER BY')
    .replace(/\bLIMIT\b/gi, '\nLIMIT')
    .trim();
};

/**
 * Format JSON for display
 */
export const formatJSON = (data: any): string => {
  if (!data) return 'No data';
  try {
    if (typeof data === 'string') {
      // Try to parse if it's a JSON string
      try {
        const parsed = JSON.parse(data);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return data;
      }
    }
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

/**
 * Format response time for display
 */
export const formatResponseTimeDisplay = (ms: number | null | undefined): string => {
  if (ms === null || ms === undefined) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

// ============================================
// BADGE & STATUS FUNCTIONS
// ============================================

/**
 * Get status badge color
 */
export const getStatusColor = (isSuccess: boolean): string => {
  return isSuccess 
    ? 'bg-green-500 hover:bg-green-600' 
    : 'bg-red-500 hover:bg-red-600';
};

/**
 * Get status badge variant
 */
export const getStatusBadgeVariant = (isSuccess: boolean): 'default' | 'destructive' => {
  return isSuccess ? 'default' : 'destructive';
};

/**
 * Get severity badge class
 */
export const getSeverityBadgeClass = (severity: string | undefined): string => {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return 'bg-red-600 text-white hover:bg-red-700';
    case 'high':
      return 'bg-orange-500 text-white hover:bg-orange-600';
    case 'medium':
      return 'bg-yellow-500 text-white hover:bg-yellow-600';
    case 'low':
      return 'bg-blue-500 text-white hover:bg-blue-600';
    default:
      return 'bg-gray-500 text-white hover:bg-gray-600';
  }
};

/**
 * Get risk level color
 */
export const getRiskLevelColor = (level: string | undefined): string => {
  switch (level?.toLowerCase()) {
    case 'critical':
      return 'text-red-600';
    case 'high':
      return 'text-orange-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-blue-500';
    default:
      return 'text-gray-500';
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

/**
 * Check if value is valid
 */
export const isValidValue = (value: any): boolean => {
  return value !== null && value !== undefined && value !== '';
};

/**
 * Get display value with fallback
 */
export const getDisplayValue = (value: any, fallback: string = '-'): string => {
  if (!isValidValue(value)) return fallback;
  return String(value);
};

/**
 * Format number with locale
 */
export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('id-ID');
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number | null | undefined, decimals: number = 1): string => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) return formatTableDate(dateString);
    if (diffDays > 0) return `${diffDays} hari yang lalu`;
    if (diffHours > 0) return `${diffHours} jam yang lalu`;
    if (diffMins > 0) return `${diffMins} menit yang lalu`;
    return 'Baru saja';
  } catch {
    return String(dateString);
  }
};
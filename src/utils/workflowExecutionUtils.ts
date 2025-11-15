// utils/workflowExecutionUtils.ts

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { WorkflowExecution } from "../types/workflowExecution";
import { EXECUTION_CONSTANTS } from "../constants/workflowExecution";

/**
 * Format execution time dari milliseconds
 */
export const formatExecutionTime = (ms: number | undefined | null): string => {
  if (ms === undefined || ms === null) return "-";
  if (ms >= 1000) {
    return (ms / 1000).toFixed(2) + "s";
  }
  return ms.toFixed(0) + "ms";
};

/**
 * Format tanggal dengan locale Indonesia
 */
export const formatDateTime = (
  dateString: string, 
  formatStr: string = EXECUTION_CONSTANTS.DATE_FORMAT.SHORT
): string => {
  return format(new Date(dateString), formatStr, { locale: id });
};

/**
 * Generate ISO string untuk filter tanggal dengan timezone handling
 */
export const getDateRangeForFilter = (dateString: string, isEndDate: boolean): string => {
  const date = new Date(dateString);
  if (isEndDate) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date.toISOString();
};

/**
 * Generate CSV content dari array executions
 */
export const generateExecutionCSV = (executions: WorkflowExecution[]): string => {
  const headers = [
    "Execution ID",
    "Workflow Name",
    "Status",
    "Total Execution Time (ms)",
    "Estimated Cost (USD)",
    "Total Tokens",
    "Has Errors",
    "Error Node Name",
    "Error Message",
    "Created At"
  ];

  const rows = executions.map(e => [
    `"${e.execution_id}"`,
    `"${e.workflow_name || 'N/A'}"`,
    e.status,
    e.total_execution_time_ms ?? "-",
    e.estimated_cost_usd.toFixed(6),
    e.total_tokens,
    e.has_errors ? "Yes" : "No",
    `"${e.error_node_name || '-'}"`,
    `"${e.error_message || '-'}"`,
    format(new Date(e.created_at), EXECUTION_CONSTANTS.DATE_FORMAT.EXPORT),
  ].join(","));

  return [headers.join(","), ...rows].join("\n");
};

/**
 * Download CSV file ke browser
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
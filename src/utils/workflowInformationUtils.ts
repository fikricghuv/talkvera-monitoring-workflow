// utils/workflowInformationUtils.ts

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { WorkflowInfo } from "@/types/workflowInformation";
import { WORKFLOW_CONSTANTS } from "@/constants/workflowInformation";

/**
 * Format waktu dalam menit ke format "X jam Y menit"
 */
export const formatTime = (minutes: number): string => {
  if (minutes === 0) return "0 menit";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours} jam`);
  if (mins > 0 || parts.length === 0) parts.push(`${mins} menit`);
  
  return parts.join(' ');
};

/**
 * Format tanggal dengan locale Indonesia
 */
export const formatDateTime = (
  dateString: string, 
  formatStr: string = WORKFLOW_CONSTANTS.DATE_FORMAT.SHORT
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
 * Generate CSV content dari array workflows
 */
export const generateWorkflowCSV = (workflows: WorkflowInfo[]): string => {
  const headers = [
    "Workflow ID",
    "Name",
    "Status",
    "Total Nodes",
    "Time Saved (minutes)",
    "Error Workflow Call",
    "Created At",
    "Updated At"
  ];

  const rows = workflows.map(w => [
    `"${w.workflow_id}"`,
    `"${w.name}"`,
    w.active_status ? "Active" : "Inactive",
    w.total_nodes,
    w.time_saved_per_execution,
    `"${w.error_workflow_call || '-'}"`,
    format(new Date(w.created_at), WORKFLOW_CONSTANTS.DATE_FORMAT.EXPORT),
    w.updated_at ? format(new Date(w.updated_at), WORKFLOW_CONSTANTS.DATE_FORMAT.EXPORT) : "-"
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
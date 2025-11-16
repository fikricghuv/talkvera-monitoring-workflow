// src/utils/agentUtils.ts

import { format, subDays } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Format response time from milliseconds
 */
export const formatResponseTime = (ms: number | undefined | null): string => {
  if (ms === undefined || ms === null) return "-";
  if (ms >= 1000) {
    return (ms / 1000).toFixed(2) + "s";
  }
  return ms.toFixed(0) + "ms";
};

/**
 * Format number with locale
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return value.toFixed(decimals) + "%";
};

/**
 * Format date for display
 */
export const formatDate = (date: string, formatString: string = "dd MMM yyyy"): string => {
  return format(new Date(date), formatString, { locale: id });
};

/**
 * Get default date range (last N days)
 */
export const getDefaultDateRange = (days: number = 7): { start: string; end: string } => {
  const end = new Date();
  const start = subDays(end, days);
  
  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
  };
};

/**
 * Calculate success rate
 */
export const calculateSuccessRate = (successful: number, total: number): number => {
  if (total === 0) return 0;
  return (successful / total) * 100;
};

/**
 * Calculate average
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

/**
 * Group data by date
 */
export const groupByDate = <T extends { created_at: string }>(
  data: T[],
  dateRange: { start: string; end: string }
): Map<string, T[]> => {
  const grouped = new Map<string, T[]>();
  
  // Initialize all dates in range
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateKey = format(d, "yyyy-MM-dd");
    grouped.set(dateKey, []);
  }
  
  // Group data
  data.forEach(item => {
    const dateKey = format(new Date(item.created_at), "yyyy-MM-dd");
    if (grouped.has(dateKey)) {
      grouped.get(dateKey)!.push(item);
    }
  });
  
  return grouped;
};

/**
 * Get risk severity color class
 */
export const getRiskSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600',
  };
  return colors[severity] || 'text-gray-600';
};

/**
 * Truncate text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
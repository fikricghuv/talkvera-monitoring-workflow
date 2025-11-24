// src/utils/n8nToolUsageUtils.ts

import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

/**
 * Calculate success rate
 */
export const calculateSuccessRate = (successful: number, total: number): number => {
  if (total === 0) return 0;
  return (successful / total) * 100;
};

/**
 * Format date
 */
export const formatDate = (dateString: string, formatString: string): string => {
  try {
    return format(parseISO(dateString), formatString, { locale: localeId });
  } catch {
    return dateString;
  }
};

/**
 * Group data by date
 */
export const groupByDate = (
  items: any[],
  dateRange: { start: string; end: string }
): Map<string, any[]> => {
  const grouped = new Map<string, any[]>();
  
  // Initialize all dates in range
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    grouped.set(dateStr, []);
  }
  
  // Group items
  items.forEach(item => {
    const date = item.executed_at.split('T')[0];
    if (grouped.has(date)) {
      grouped.get(date)!.push(item);
    }
  });
  
  return grouped;
};

/**
 * Get unique values from array
 */
export const getUniqueValues = (items: any[], key: string): Set<string> => {
  return new Set(items.map(item => item[key]).filter(Boolean));
};
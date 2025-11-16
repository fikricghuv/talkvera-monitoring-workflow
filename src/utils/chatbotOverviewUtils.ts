// utils/chatbotOverviewUtils.ts

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { OVERVIEW_CONSTANTS } from "../constants/chatbotOverview";

/**
 * Format tanggal dengan locale Indonesia
 */
export const formatDateTime = (
  dateString: string, 
  formatStr: string = OVERVIEW_CONSTANTS.DATE_FORMAT.SHORT
): string => {
  return format(new Date(dateString), formatStr, { locale: id });
};

/**
 * Format duration dari start ke end time
 */
export const formatDuration = (startTime: string, endTime: string | null): string => {
  if (!endTime) return "Ongoing";
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Format number dengan locale
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('id-ID');
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} hari yang lalu`;
  if (hours > 0) return `${hours} jam yang lalu`;
  if (minutes > 0) return `${minutes} menit yang lalu`;
  return "Baru saja";
};
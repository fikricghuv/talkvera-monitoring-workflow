// src/utils/operasionalBisnisToolUsageUtils.ts

import { format, parseISO, eachDayOfInterval } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Calculate success rate percentage
 */
export const calculateSuccessRate = (successful: number, total: number): number => {
  if (total === 0) return 0;
  return (successful / total) * 100;
};

/**
 * Format date string
 */
export const formatDate = (dateStr: string, formatStr: string = 'dd MMM yyyy'): string => {
  try {
    const date = parseISO(dateStr);
    return format(date, formatStr, { locale: id });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
};

/**
 * Format datetime string
 */
export const formatDateTime = (dateStr: string): string => {
  try {
    const date = parseISO(dateStr);
    return format(date, 'dd MMM yyyy HH:mm', { locale: id });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return dateStr;
  }
};

/**
 * Get unique values from array of objects for a specific key
 */
export const getUniqueValues = (arr: any[], key: string): Set<any> => {
  return new Set(arr.map(item => item[key]).filter(Boolean));
};

/**
 * Group data by date
 */
export const groupByDate = (
  data: any[],
  dateRange: { start: string; end: string }
): Map<string, any[]> => {
  const startDate = parseISO(dateRange.start);
  const endDate = parseISO(dateRange.end);
  
  // Create a map with all dates in range initialized with empty arrays
  const dateMap = new Map<string, any[]>();
  const dates = eachDayOfInterval({ start: startDate, end: endDate });
  
  dates.forEach(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    dateMap.set(dateStr, []);
  });

  // Group data by date
  data.forEach(item => {
    const itemDate = format(parseISO(item.executed_at || item.created_at), 'yyyy-MM-dd');
    if (dateMap.has(itemDate)) {
      dateMap.get(itemDate)!.push(item);
    }
  });

  return dateMap;
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};

/**
 * Format percentage
 */
export const formatPercentage = (num: number, decimals: number = 1): string => {
  return `${num.toFixed(decimals)}%`;
};

/**
 * Get lifecycle stage color
 */
export const getLifecycleStageColor = (stage: string): string => {
  const colors: Record<string, string> = {
    lead: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-blue-100 text-blue-800',
    customer: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
  };
  return colors[stage] || 'bg-gray-100 text-gray-800';
};

/**
 * Get lead status color
 */
export const getLeadStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    follow_up: 'bg-purple-100 text-purple-800',
    closed_won: 'bg-green-100 text-green-800',
    closed_lost: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get source badge color
 */
export const getSourceBadgeColor = (source: string): string => {
  const colors: Record<string, string> = {
    landing_page: 'bg-blue-100 text-blue-800',
    whatsapp: 'bg-green-100 text-green-800',
    manual: 'bg-gray-100 text-gray-800',
  };
  return colors[source] || 'bg-gray-100 text-gray-800';
};

/**
 * Get session status color
 */
export const getSessionStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    ABANDONED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get appointment status color
 */
export const getAppointmentStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    canceled: 'bg-red-100 text-red-800',
    rescheduled: 'bg-yellow-100 text-yellow-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Calculate session duration in minutes
 */
export const calculateSessionDuration = (startTime: string, endTime: string | null): number => {
  if (!endTime) return 0;
  
  const start = parseISO(startTime);
  const end = parseISO(endTime);
  const durationMs = end.getTime() - start.getTime();
  
  return Math.round(durationMs / 1000 / 60); // Convert to minutes
};

/**
 * Format duration (minutes to human readable)
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} menit`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} jam`;
  }
  
  return `${hours} jam ${remainingMinutes} menit`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  if (!name) return '??';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format (Indonesia)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Format phone number (Indonesia)
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\s/g, '');
  
  if (cleaned.startsWith('+62')) {
    return cleaned;
  } else if (cleaned.startsWith('62')) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('0')) {
    return '+62' + cleaned.substring(1);
  }
  
  return phone;
};
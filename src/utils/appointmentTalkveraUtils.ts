import { format, parseISO, isToday, isPast } from "date-fns";
import { id } from "date-fns/locale";

export const formatAppointmentDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, "dd MMM yyyy, HH:mm", { locale: id });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

export const formatAppointmentDateLong = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, "EEEE, dd MMMM yyyy - HH:mm 'WIB'", { locale: id });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

export const isAppointmentToday = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    return isToday(date);
  } catch (error) {
    console.error("Error checking if appointment is today:", error);
    return false;
  }
};

export const isAppointmentPast = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    return isPast(date) && !isToday(date);
  } catch (error) {
    console.error("Error checking if appointment is past:", error);
    return false;
  }
};

export const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    scheduled: "Terjadwal",
    completed: "Selesai",
    canceled: "Dibatalkan",
    rescheduled: "Dijadwal Ulang"
  };
  return statusMap[status] || status;
};

export const getSourceLabel = (source: string): string => {
  const sourceMap: Record<string, string> = {
    landing_page: "Landing Page",
    whatsapp: "WhatsApp",
    manual: "Manual"
  };
  return sourceMap[source] || source;
};

interface StatusConfig {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
}

export const getAppointmentStatusConfig = (status: string): StatusConfig => {
  const configs: Record<string, StatusConfig> = {
    scheduled: {
      label: "Terjadwal",
      variant: "default",
      className: "bg-blue-100 text-blue-700 hover:bg-blue-200"
    },
    completed: {
      label: "Selesai",
      variant: "secondary",
      className: "bg-green-100 text-green-700 hover:bg-green-200"
    },
    canceled: {
      label: "Dibatalkan",
      variant: "destructive",
      className: "bg-red-100 text-red-700 hover:bg-red-200"
    },
    rescheduled: {
      label: "Dijadwal Ulang",
      variant: "outline",
      className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
    }
  };

  return configs[status] || {
    label: status,
    variant: "outline",
    className: "bg-gray-100 text-gray-700"
  };
};
export const formatAppointmentDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatAppointmentDateLong = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const getAppointmentStatusConfig = (status: string) => {
  const variants: Record<
    string,
    { 
      variant: "default" | "destructive" | "secondary" | "outline";
      className: string;
      label: string;
    }
  > = {
    scheduled: {
      variant: "default",
      className: "bg-blue-500 text-white hover:bg-blue-600",
      label: "Terjadwal"
    },
    completed: {
      variant: "secondary",
      className: "bg-green-500 text-white hover:bg-green-600",
      label: "Selesai"
    },
    canceled: {
      variant: "destructive",
      className: "",
      label: "Dibatalkan"
    },
    rescheduled: {
      variant: "default",
      className: "bg-purple-500 text-white hover:bg-purple-600",
      label: "Dijadwal Ulang"
    }
  };

  const config = variants[status] || variants.scheduled;
  return config;
};

export const isAppointmentToday = (dateString: string): boolean => {
  const appointmentDate = new Date(dateString);
  const today = new Date();
  
  return (
    appointmentDate.getDate() === today.getDate() &&
    appointmentDate.getMonth() === today.getMonth() &&
    appointmentDate.getFullYear() === today.getFullYear()
  );
};

export const isAppointmentPast = (dateString: string): boolean => {
  const appointmentDate = new Date(dateString);
  const now = new Date();
  return appointmentDate < now;
};
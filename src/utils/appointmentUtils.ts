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
    }
  > = {
    BOOKED: {
      variant: "default",
      className: "bg-blue-500 text-white hover:bg-blue-600"
    },
    CONFIRMED: {
      variant: "default",
      className: "bg-green-500 text-white hover:bg-green-600"
    },
    COMPLETED: {
      variant: "secondary",
      className: "bg-gray-500 text-white hover:bg-gray-600"
    },
    CANCELLED: {
      variant: "destructive",
      className: ""
    },
    NO_SHOW: {
      variant: "outline",
      className: "border-orange-500 text-orange-600"
    },
    RESCHEDULED: {
      variant: "default",
      className: "bg-purple-500 text-white hover:bg-purple-600"
    }
  };

  const config = variants[status] || variants.BOOKED;
  return {
    ...config,
    label: status.replace(/_/g, ' ')
  };
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
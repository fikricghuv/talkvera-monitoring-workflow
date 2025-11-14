export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  }).format(date);
};

export const formatDateLong = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit'
  }).format(date);
};

export const getQueueStatusConfig = (status: string) => {
  const variants: Record<
    string,
    { variant: "default" | "destructive" | "secondary" | "outline"; className: string }
  > = {
    pending: { 
      variant: "secondary", 
      className: "bg-yellow-500 text-white hover:bg-yellow-600" 
    },
    processing: { 
      variant: "default", 
      className: "bg-blue-500 text-white hover:bg-blue-600" 
    },
    done: { 
      variant: "default", 
      className: "bg-green-500 text-white hover:bg-green-600" 
    },
    failed: { 
      variant: "destructive", 
      className: "" 
    },
  };
  
  const config = variants[status] || variants.pending;
  return {
    ...config,
    label: status.charAt(0).toUpperCase() + status.slice(1)
  };
};
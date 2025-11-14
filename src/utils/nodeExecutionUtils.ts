export const getStatusConfig = (status: string | null) => {
  if (!status) {
    return {
      variant: "secondary" as const,
      className: "",
      label: "Unknown"
    };
  }
  
  const lowerStatus = status.toLowerCase();
  const variants: Record<string, { 
    variant: "default" | "destructive" | "secondary" | "outline", 
    className: string 
  }> = {
    success: { 
      variant: "default", 
      className: "bg-green-500 text-white hover:bg-green-600" 
    },
    error: { 
      variant: "destructive", 
      className: "bg-red-500 text-white hover:bg-red-600" 
    },
    running: { 
      variant: "default", 
      className: "bg-blue-500 text-white hover:bg-blue-600" 
    },
    skipped: { 
      variant: "outline", 
      className: "border-gray-400 text-gray-600" 
    },
    default: { 
      variant: "secondary", 
      className: "" 
    },
  };

  const config = variants[lowerStatus] || variants.default;
  return {
    ...config,
    label: status.charAt(0).toUpperCase() + status.slice(1)
  };
};

export const formatExecutionTime = (ms: number | null): string => {
  if (!ms) return "N/A";
  if (ms >= 1000) {
    return (ms / 1000).toFixed(2) + "s";
  }
  return ms.toFixed(0) + "ms";
};
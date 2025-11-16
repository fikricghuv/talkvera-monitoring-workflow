// constants/chatbotOverview.ts

export const OVERVIEW_CONSTANTS = {
  TABLE_PATIENTS: "ms_patients",
  TABLE_SESSIONS: "dt_chat_sessions",
  TABLE_MESSAGES: "dt_chat_messages",
  TABLE_APPOINTMENTS: "dt_appointments",
  RECENT_SESSIONS_LIMIT: 10,
  AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
  DATE_FORMAT: {
    SHORT: "dd MMM yyyy, HH:mm",
    LONG: "dd MMMM yyyy, HH:mm:ss",
  },
} as const;

export const SESSION_STATUS_CONFIG: Record<string, { 
  variant: "default" | "destructive" | "secondary" | "outline"; 
  className: string;
  label: string;
}> = {
  IN_PROGRESS: { 
    variant: "secondary", 
    className: "bg-yellow-500 text-black hover:bg-yellow-600",
    label: "In Progress"
  },
  COMPLETED: { 
    variant: "default", 
    className: "bg-green-500 text-white hover:bg-green-600",
    label: "Completed"
  },
  ABANDONED: { 
    variant: "destructive", 
    className: "",
    label: "Abandoned"
  },
};

export const CHART_COLORS = {
  IN_PROGRESS: "#eab308", // yellow-500
  COMPLETED: "#22c55e", // green-500
  ABANDONED: "#ef4444", // red-500
} as const;
// constants/workflowExecution.ts

export const EXECUTION_CONSTANTS = {
  TABLE_NAME: "dt_workflow_executions",
  NODE_TABLE_NAME: "dt_node_executions",
  MIN_SEARCH_LENGTH: 3,
  DEBOUNCE_DELAY: 500,
  DEFAULT_ITEMS_PER_PAGE: 10,
  ITEMS_PER_PAGE_OPTIONS: [10, 25, 50, 100],
  DATE_FORMAT: {
    SHORT: "dd MMM yyyy, HH:mm",
    LONG: "dd MMMM yyyy, HH:mm:ss",
    FILE: "yyyy-MM-dd_HHmmss",
    EXPORT: "yyyy-MM-dd HH:mm:ss",
  },
  STATUS_OPTIONS: [
    { value: "all", label: "Semua Status" },
    { value: "success", label: "Success" },
    { value: "error", label: "Error" },
    { value: "running", label: "Running" },
    { value: "cancelled", label: "Cancelled" },
    { value: "skipped", label: "Skipped" },
  ],
} as const;

export const STATUS_CONFIG: Record<string, { 
  variant: "default" | "destructive" | "secondary" | "outline"; 
  className: string 
}> = {
  success: { variant: "default", className: "bg-green-500 text-white hover:bg-green-600" },
  error: { variant: "destructive", className: "" },
  running: { variant: "secondary", className: "bg-yellow-500 text-black hover:bg-yellow-600" },
  cancelled: { variant: "outline", className: "" },
  skipped: { variant: "outline", className: "border-gray-400 text-gray-600" },
};
// constants/workflowInformation.ts

export const WORKFLOW_CONSTANTS = {
  TABLE_NAME: "dt_workflow_information",
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
} as const;
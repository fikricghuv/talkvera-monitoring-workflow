export interface QueueItem {
  id: string;
  execution_id: string;
  workflow_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RawQueueData {
  id: string;
  execution_id: string;
  workflow_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface QueueKPI {
  newQueue: number;
  processed: number;
  failed: number;
}

export interface QueueFilterState {
  searchTerm: string;
  debouncedSearchTerm: string;
  statusFilter: string;
  startDate: string;
  endDate: string;
}
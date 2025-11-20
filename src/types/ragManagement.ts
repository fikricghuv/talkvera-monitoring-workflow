// types/rag.ts

export interface RagDocument {
  id: string;
  title: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string | null;
  description: string | null;
  tags: string[] | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_status: any;
  n8n_webhook_url: string | null;
  indexed_at: string | null;
  metadata: any;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RagUrl {
  id: string;
  title: string;
  url: string;
  description: string | null;
  tags: string[] | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_status: any;
  n8n_webhook_url: string | null;
  last_crawled_at: string | null;
  crawl_frequency: 'daily' | 'weekly' | 'monthly' | 'manual' | null;
  metadata: any;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RagMetrics {
  totalDocuments: number;
  totalUrls: number;
  pendingItems: number;
  completedItems: number;
  failedItems: number;
  totalSize: number;
}

export interface UploadFile {
  file: File;
  title: string;
  description: string;
  tags: string[];
}

export interface RagFilters {
  searchTerm: string;
  debouncedSearchTerm?: string; // <-- TAMBAHKAN INI (gunakan ? agar optional)
  statusFilter: string;
  typeFilter: 'all' | 'documents' | 'urls';
  startDate: string;
  endDate: string;
  tagFilter: string;
}
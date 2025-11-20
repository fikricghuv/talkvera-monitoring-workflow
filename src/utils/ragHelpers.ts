// utils/ragHelpers.ts

import { supabase } from "@/integrations/supabase/client";
import { RagDocument, RagUrl } from "@/types/ragManagement";

/**
 * Validate file type berdasarkan extension dan MIME type
 */
export const validateFileType = (file: File): { valid: boolean; error?: string } => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx', '.xls'];
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  const hasValidMimeType = allowedMimeTypes.includes(file.type);

  if (!hasValidExtension && !hasValidMimeType) {
    return {
      valid: false,
      error: `File type tidak didukung. Format yang diperbolehkan: ${allowedExtensions.join(', ')}`
    };
  }

  return { valid: true };
};

/**
 * Validate file size (default max: 10MB)
 */
export const validateFileSize = (
  file: File, 
  maxSizeMB: number = 10
): { valid: boolean; error?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB. File Anda: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }

  return { valid: true };
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): { valid: boolean; error?: string } => {
  try {
    const urlObj = new URL(url);
    
    // Check protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        valid: false,
        error: 'URL harus menggunakan protokol HTTP atau HTTPS'
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Format URL tidak valid'
    };
  }
};

/**
 * Generate unique file name dengan timestamp dan random string
 */
export const generateUniqueFileName = (originalFileName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const extension = originalFileName.split('.').pop();
  return `${timestamp}_${random}.${extension}`;
};

/**
 * Format file size ke human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Get file extension dari filename
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || 'unknown';
};

/**
 * Download file dari Supabase Storage
 */
export const downloadFileFromStorage = async (
  bucketName: string,
  filePath: string
): Promise<{ data: Blob | null; error: any }> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get public URL untuk file di storage (jika bucket public)
 */
export const getPublicUrl = (bucketName: string, filePath: string): string => {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * Delete file dari storage
 */
export const deleteFileFromStorage = async (
  bucketName: string,
  filePath: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Batch upload files dengan progress tracking
 */
export const batchUploadFiles = async (
  files: File[],
  onProgress?: (progress: number, currentFile: string) => void
): Promise<{ successes: string[]; failures: { file: string; error: any }[] }> => {
  const successes: string[] = [];
  const failures: { file: string; error: any }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = generateUniqueFileName(file.name);
    const filePath = `rag-documents/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) throw error;

      successes.push(filePath);

      if (onProgress) {
        const progress = ((i + 1) / files.length) * 100;
        onProgress(progress, file.name);
      }
    } catch (error) {
      failures.push({ file: file.name, error });
    }
  }

  return { successes, failures };
};

/**
 * Check if URL already exists in database
 */
export const checkUrlExists = async (url: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('dt_rag_urls')
    .select('id')
    .eq('url', url)
    .maybeSingle();

  return !error && data !== null;
};

/**
 * Get document by ID
 */
export const getDocumentById = async (
  id: string
): Promise<{ data: RagDocument | null; error: any }> => {
  const { data, error } = await supabase
    .from('dt_rag_documents')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
};

/**
 * Get URL by ID
 */
export const getUrlById = async (
  id: string
): Promise<{ data: RagUrl | null; error: any }> => {
  const { data, error } = await supabase
    .from('dt_rag_urls')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
};

/**
 * Update document status
 */
export const updateDocumentStatus = async (
  id: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  processingStatus?: any
): Promise<{ success: boolean; error?: any }> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (processingStatus) {
      updateData.processing_status = processingStatus;
    }

    if (status === 'completed') {
      updateData.indexed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('dt_rag_documents')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Update URL status
 */
export const updateUrlStatus = async (
  id: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  processingStatus?: any
): Promise<{ success: boolean; error?: any }> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (processingStatus) {
      updateData.processing_status = processingStatus;
    }

    if (status === 'completed') {
      updateData.last_crawled_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('dt_rag_urls')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Trigger N8n webhook
 */
export const triggerN8nWebhook = async (
  webhookUrl: string,
  payload: any
): Promise<{ success: boolean; response?: any; error?: any }> => {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, response: data };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Get all unique tags from documents and URLs
 */
export const getAllTags = async (): Promise<string[]> => {
  try {
    const { data: docs } = await supabase
      .from('dt_rag_documents')
      .select('tags');

    const { data: urls } = await supabase
      .from('dt_rag_urls')
      .select('tags');

    const allTags = new Set<string>();

    docs?.forEach(doc => {
      if (doc.tags) {
        doc.tags.forEach((tag: string) => allTags.add(tag));
      }
    });

    urls?.forEach(url => {
      if (url.tags) {
        url.tags.forEach((tag: string) => allTags.add(tag));
      }
    });

    return Array.from(allTags).sort();
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

/**
 * Calculate total storage size
 */
export const calculateTotalStorageSize = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('dt_rag_documents')
      .select('file_size');

    if (error) throw error;

    return data?.reduce((sum, doc) => sum + (Number(doc.file_size) || 0), 0) || 0;
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return 0;
  }
};

/**
 * Sanitize tag input
 */
export const sanitizeTag = (tag: string): string => {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
};

/**
 * Validate tags array
 */
export const validateTags = (
  tags: string[]
): { valid: boolean; error?: string } => {
  if (tags.length > 20) {
    return {
      valid: false,
      error: 'Maksimal 20 tags per item'
    };
  }

  for (const tag of tags) {
    if (tag.length > 50) {
      return {
        valid: false,
        error: 'Setiap tag maksimal 50 karakter'
      };
    }
  }

  return { valid: true };
};
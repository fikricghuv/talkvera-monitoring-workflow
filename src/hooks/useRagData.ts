// hooks/useRagData.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RagDocument, RagUrl, RagMetrics, RagFilters } from "@/types/ragManagement";
import { toast } from "sonner";

export const useRagData = (
  filters: Partial<RagFilters>,
  currentPage: number,
  itemsPerPage: number
) => {
  const [items, setItems] = useState<(RagDocument | RagUrl)[]>([]);
  const [metrics, setMetrics] = useState<RagMetrics>({
    totalDocuments: 0,
    totalUrls: 0,
    pendingItems: 0,
    completedItems: 0,
    failedItems: 0,
    totalSize: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Helper untuk menghitung metrics di sisi client
  const calculateMetrics = (allItems: (RagDocument | RagUrl)[]) => {
    const docs = allItems.filter(i => 'file_name' in i) as RagDocument[];
    const urls = allItems.filter(i => 'url' in i) as RagUrl[];

    setMetrics({
      totalDocuments: docs.length,
      totalUrls: urls.length,
      pendingItems: allItems.filter(i => i.status === 'pending').length,
      completedItems: allItems.filter(i => i.status === 'completed').length,
      failedItems: allItems.filter(i => i.status === 'failed').length,
      totalSize: docs.reduce((sum, doc) => sum + (Number(doc.file_size) || 0), 0)
    });
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const promises = [];

      // Helper untuk membuat query (didefinisikan di dalam agar akses scope aman)
      const createQuery = (table: string) => {
        let query = supabase.from(table as any).select("*");

        // Date Filter
        if (filters.startDate) {
          const startDateTime = new Date(filters.startDate);
          startDateTime.setHours(0, 0, 0, 0);
          query = query.gte("created_at", startDateTime.toISOString());
        }

        if (filters.endDate) {
          const endDateTime = new Date(filters.endDate);
          endDateTime.setHours(23, 59, 59, 999);
          query = query.lte("created_at", endDateTime.toISOString());
        }

        // Status Filter
        if (filters.statusFilter && filters.statusFilter !== 'all') {
          query = query.eq("status", filters.statusFilter);
        }

        // Tags Filter
        if (filters.tagFilter) {
          query = query.contains("tags", [filters.tagFilter]);
        }

        return query;
      };

      // 1. Query Documents
      if (!filters.typeFilter || filters.typeFilter === 'all' || filters.typeFilter === 'documents') {
        promises.push(createQuery("dt_rag_documents"));
      } else {
        promises.push(Promise.resolve({ data: [], error: null }));
      }

      // 2. Query URLs
      if (!filters.typeFilter || filters.typeFilter === 'all' || filters.typeFilter === 'urls') {
        promises.push(createQuery("dt_rag_urls"));
      } else {
        promises.push(Promise.resolve({ data: [], error: null }));
      }

      // Eksekusi Query Paralel
      const [docRes, urlRes] = await Promise.all(promises);

      if (docRes.error) throw docRes.error;
      if (urlRes.error) throw urlRes.error;

      const docs = (docRes.data || []) as RagDocument[];
      const urls = (urlRes.data || []) as RagUrl[];

      // Merge results
      let allItems = [...docs, ...urls];

      // Client-side Search Filtering (Loose Search)
      if (filters.debouncedSearchTerm) {
        const search = filters.debouncedSearchTerm.toLowerCase();
        allItems = allItems.filter(item => {
          const title = item.title?.toLowerCase() || '';
          const fileName = 'file_name' in item ? item.file_name.toLowerCase() : '';
          const url = 'url' in item ? item.url.toLowerCase() : '';
          
          return title.includes(search) || fileName.includes(search) || url.includes(search);
        });
      }

      // Client-side Sorting (Created At DESC)
      allItems.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      // Update Metrics & Total Count
      calculateMetrics(allItems);
      setTotalCount(allItems.length);

      // Client-side Pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedItems = allItems.slice(startIndex, startIndex + itemsPerPage);

      setItems(paginatedItems);

    } catch (error) {
      console.error("Error fetching RAG data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
    
    // PERBAIKAN DISINI: 
    // Menggunakan properti spesifik, BUKAN object 'filters' utuh
  }, [
    currentPage, 
    itemsPerPage, 
    filters.debouncedSearchTerm,
    filters.statusFilter,
    filters.typeFilter,
    filters.tagFilter,
    filters.startDate,
    filters.endDate
  ]);

  const updateItem = async (id: string, updates: Partial<RagDocument | RagUrl>) => {
    try {
      // Cari item di state saat ini untuk menentukan jenis tabelnya
      const currentItem = items.find(i => i.id === id);
      if (!currentItem) return; // Fail silently if not found in current view

      const isDocument = 'file_name' in currentItem;
      const table = isDocument ? "dt_rag_documents" : "dt_rag_urls";

      const { error } = await supabase
        .from(table as any)
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      // Optimistic update
      setItems(items.map(item => 
        item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
      ));
      
      toast.success("Item berhasil diupdate");
      fetchData(); 
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Gagal mengupdate item");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const currentItem = items.find(i => i.id === id);
      if (!currentItem) return;

      const isDocument = 'file_name' in currentItem;
      const table = isDocument ? "dt_rag_documents" : "dt_rag_urls";

      const { error } = await supabase
        .from(table as any)
        .delete()
        .eq("id", id);

      if (error) throw error;

      setItems(items.filter(item => item.id !== id));
      setTotalCount(prev => prev - 1);
      
      toast.success("Item berhasil dihapus");
      fetchData();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Gagal menghapus item");
    }
  };

  const refetch = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    items,
    metrics,
    isLoading,
    totalCount,
    refetch,
    updateItem,
    deleteItem
  };
};
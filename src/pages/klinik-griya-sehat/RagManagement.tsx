import { useState, useEffect } from "react";
import { toast } from "sonner";
import { RagDocument, RagUrl } from "@/types/ragManagement";
import { useRagData } from "@/hooks/useRagData";
import { RagSkeleton } from "@/components/klinikGriyaSehat/ragManagement/RagSkeleton";
import { RagHeader } from "@/components/klinikGriyaSehat/ragManagement/RagHeader";
import { RagMetrics } from "@/components/klinikGriyaSehat/ragManagement/RagMetrics";
import { RagFilters } from "@/components/klinikGriyaSehat/ragManagement/RagFilters";
import { RagTable } from "@/components/klinikGriyaSehat/ragManagement/RagTable";
import { RagUploadModal } from "@/components/klinikGriyaSehat/ragManagement/RagUploadModal";
import { RagDetailModal } from "@/components/klinikGriyaSehat/ragManagement/RagDetailModal";
import { RagConfirmationModal } from "@/components/klinikGriyaSehat/ragManagement/RagConfirmationModal";

const RagManagement = () => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "documents" | "urls">("all");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Modal States
  const [selectedItem, setSelectedItem] = useState<RagDocument | RagUrl | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'document' | 'url'>('document');
  
  // Process States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

  // ✨ Delete States (BARU)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; item: RagDocument | RagUrl } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        setDebouncedSearchTerm(searchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, typeFilter, tagFilter, startDate, endDate]);

  // Custom hook for fetching data
  const {
    items,
    metrics,
    isLoading,
    totalCount,
    refetch,
    updateItem,
    deleteItem
  } = useRagData(
    { searchTerm, debouncedSearchTerm, statusFilter, typeFilter, tagFilter, startDate, endDate },
    currentPage,
    itemsPerPage
  );

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const pendingCount = items.filter(item => item.status === 'pending').length;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    toast.info("Memuat ulang data...");
    refetch();
  };

  const handleRowClick = (item: RagDocument | RagUrl) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleUpdateItem = (id: string, updates: Partial<RagDocument | RagUrl>) => {
    updateItem(id, updates);
  };

  // ✨ Handler untuk membuka modal konfirmasi delete (BARU)
  const handleOpenDeleteModal = (id: string, item: RagDocument | RagUrl) => {
    setItemToDelete({ id, item });
    setIsDeleteModalOpen(true);
  };

  // ✨ Handler untuk konfirmasi delete (BARU)
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await deleteItem(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      // Error sudah di-handle di useRagData
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenUploadModal = (type: 'document' | 'url') => {
    setUploadType(type);
    setIsUploadModalOpen(true);
  };

  const handleOpenProcessModal = () => {
    if (pendingCount === 0) {
      toast.warning("Tidak ada data pending untuk diproses");
      return;
    }
    setIsProcessModalOpen(true);
  };

  const handleConfirmProcess = async () => {
    setIsProcessing(true);
    
    try {
      const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL_PROCES_FILE;
      
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process_pending_documents',
          triggeredBy: 'user_manual_action',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.statusText}`);
      }

      toast.success(`Data akan segera diproses.`);
      setIsProcessModalOpen(false);
      
      setTimeout(() => {
        refetch();
      }, 3000);
      
    } catch (error: any) {
      console.error("Error triggering process:", error);
      toast.error(`Gagal: ${error.message || "Terjadi kesalahan koneksi"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper untuk mendapatkan nama item
  const getItemName = (item: RagDocument | RagUrl) => {
    return 'file_name' in item ? item.file_name : item.url;
  };

  if (isLoading && currentPage === 1) {
    return <RagSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <RagHeader />

        <RagMetrics metrics={metrics} />

        <RagFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          tagFilter={tagFilter}
          setTagFilter={setTagFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        <RagTable
          items={items}
          isLoading={isLoading || isProcessing}
          totalCount={totalCount}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          pendingCount={pendingCount}
          onRefresh={handleRefresh}
          onRowClick={handleRowClick}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          onDelete={handleOpenDeleteModal}
          onOpenUploadModal={handleOpenUploadModal}
          onProcess={handleOpenProcessModal}
        />

        <RagUploadModal
          isOpen={isUploadModalOpen}
          onClose={setIsUploadModalOpen}
          uploadType={uploadType}
          onUploadComplete={refetch}
        />

        <RagDetailModal
          isOpen={isDetailModalOpen}
          onClose={setIsDetailModalOpen}
          item={selectedItem}
          onUpdateItem={handleUpdateItem}
        />

        {/* Modal Konfirmasi Process */}
        <RagConfirmationModal 
          isOpen={isProcessModalOpen}
          onClose={() => !isProcessing && setIsProcessModalOpen(false)}
          onConfirm={handleConfirmProcess}
          title="Proses Data Pending"
          isLoading={isProcessing}
          description={
            <div className="space-y-2">
              <p>Anda akan memproses data yang berstatus pending.</p>
              <p>Proses ini akan berjalan di latar belakang dan mungkin memakan waktu beberapa saat tergantung jumlah data.</p>
              <br/>
              <p className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                Catatan: Pastikan data yang diupload sudah benar sebelum diproses.
              </p>
            </div>
          }
          confirmLabel="Ya, Proses Sekarang"
          variant="primary"
        />

        {/* ✨ Modal Konfirmasi Delete (BARU) */}
        <RagConfirmationModal 
          isOpen={isDeleteModalOpen}
          onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Konfirmasi Hapus Data"
          isLoading={isDeleting}
          description={
            <div className="space-y-3">
              <p className="text-gray-700">
                Anda akan menghapus item berikut:
              </p>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <p className="font-medium text-gray-900">
                  {itemToDelete?.item.title}
                </p>
                <p className="text-sm text-gray-600 mt-1 font-mono">
                  {itemToDelete && getItemName(itemToDelete.item)}
                </p>
                {itemToDelete && 'file_name' in itemToDelete.item && (
                  <div className="mt-2 text-xs text-gray-500">
                    <p>📄 File: {itemToDelete.item.file_name}</p>
                    <p>📦 Ukuran: {(itemToDelete.item.file_size / 1024).toFixed(2)} KB</p>
                  </div>
                )}
              </div>
              <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Perhatian:
                </p>
                <ul className="text-sm text-red-700 mt-1 space-y-1 list-disc list-inside">
                  <li>Data akan dihapus dari vector database</li>
                  {itemToDelete && 'file_name' in itemToDelete.item && (
                    <li>File akan dihapus dari Supabase Storage</li>
                  )}
                  <li>Data akan dihapus dari database utama</li>
                  <li>Tindakan ini tidak dapat dibatalkan</li>
                </ul>
              </div>
            </div>
          }
          confirmLabel="Ya, Hapus Sekarang"
          variant="danger"
        />
      </div>
    </div>
  );
};

export default RagManagement;
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

  const handleDeleteItem = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      deleteItem(id);
      toast.success("Item berhasil dihapus");
    }
  };

  const handleOpenUploadModal = (type: 'document' | 'url') => {
    setUploadType(type);
    setIsUploadModalOpen(true);
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
          isLoading={isLoading}
          totalCount={totalCount}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          onRefresh={handleRefresh}
          onRowClick={handleRowClick}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          onDelete={handleDeleteItem}
          onOpenUploadModal={handleOpenUploadModal}
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
      </div>
    </div>
  );
};

export default RagManagement;
// pages/ConsultationMonitoring.tsx

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ConsultationRequest, ConsultationFilterState } from "@/types/consultationRequests";
import { useConsultationRequests } from "@/hooks/useConsultationRequests";
import { ConsultationSkeleton } from "@/components/operasionalBisnis/consultation/ConsultationSkeleton";
import { ConsultationHeader } from "@/components/operasionalBisnis/consultation/ConsultationHeader";
import { ConsultationMetrics } from "@/components/operasionalBisnis/consultation/ConsultationMetrics";
import { ConsultationFilters } from "@/components/operasionalBisnis/consultation/ConsultationFilters";
import { ConsultationTable } from "@/components/operasionalBisnis/consultation/ConsultationTable";
import { ConsultationDetailModal } from "@/components/operasionalBisnis/consultation/ConsultationDetailModal";

const ConsultationMonitoring = () => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companySizeFilter, setCompanySizeFilter] = useState<string>("all");
  
  // Modal States
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
  }, [debouncedSearchTerm, statusFilter, companySizeFilter]);

  // Custom hook for fetching data
  const {
    requests,
    metrics,
    isLoading,
    totalCount,
    uniqueStatuses,
    uniqueCompanySizes,
    refetch,
    updateRequestStatus
  } = useConsultationRequests(
    { searchTerm, debouncedSearchTerm, statusFilter, companySizeFilter },
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

  const handleRowClick = (request: ConsultationRequest) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = (id: string, status: string) => {
    updateRequestStatus(id, status);
  };

  if (isLoading && currentPage === 1) {
    return <ConsultationSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <ConsultationHeader />

        <ConsultationMetrics metrics={metrics} />

        <ConsultationFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          companySizeFilter={companySizeFilter}
          setCompanySizeFilter={setCompanySizeFilter}
          uniqueStatuses={uniqueStatuses}
          uniqueCompanySizes={uniqueCompanySizes}
        />

        <ConsultationTable
          requests={requests}
          isLoading={isLoading}
          totalCount={totalCount}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          onRefresh={handleRefresh}
          onRowClick={handleRowClick}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />

        <ConsultationDetailModal
          isOpen={isDetailModalOpen}
          onClose={setIsDetailModalOpen}
          request={selectedRequest}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  );
};

export default ConsultationMonitoring;
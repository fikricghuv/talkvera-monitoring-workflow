import { useState, useEffect } from "react";
import { toast } from "sonner";
import { NodeExecution } from "@/types/nodeExecution";
import { useNodeExecutions } from "@/hooks/useNodeExecutions";
import { useExportReport } from "@/hooks/useExportReport";
import { ExecutionSkeleton } from "@/components/executionDetail/ExecutionSkeleton";
import { ExecutionHeader } from "@/components/executionDetail/ExecutionHeader";
import { ExecutionMetrics } from "@/components/executionDetail/ExecutionMetrics";
import { ExecutionFilters } from "@/components/executionDetail/ExecutionFilters";
import { ExecutionTable } from "@/components/executionDetail/ExecutionTable";
import { PaginationControls } from "@/components/PaginationControls";
import { ExecutionDetailModal } from "@/components/executionDetail/ExecutionDetailModal";

const DetailExecution = () => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Modal State
  const [selectedNode, setSelectedNode] = useState<NodeExecution | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Custom hook for fetching data
  const {
    nodeExecutions,
    metrics,
    isLoading,
    totalCount,
    uniqueStatuses,
    refetch,
    buildQuery,
    processRawData
  } = useNodeExecutions(
    { searchTerm, debouncedSearchTerm, statusFilter, startDate, endDate },
    currentPage,
    itemsPerPage
  );

  // Custom hook for export
  const { downloadReport } = useExportReport(buildQuery, processRawData);

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

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  useEffect(() => {
    handleFilterChange();
  }, [debouncedSearchTerm, statusFilter, startDate, endDate]);

  const handleDownloadReport = () => {
    downloadReport({ searchTerm, debouncedSearchTerm, statusFilter, startDate, endDate });
  };

  const handleRowClick = (node: NodeExecution) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  if (isLoading && currentPage === 1) {
    return <ExecutionSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <ExecutionHeader />

        {metrics && <ExecutionMetrics metrics={metrics} />}

        <ExecutionFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          uniqueStatuses={uniqueStatuses}
        />

        <ExecutionTable
          nodeExecutions={nodeExecutions}
          isLoading={isLoading}
          totalCount={totalCount}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onRefresh={handleRefresh}
          onDownloadReport={handleDownloadReport}
          onRowClick={handleRowClick}
        />

        {totalCount > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}

        <ExecutionDetailModal
          isOpen={isModalOpen}
          onClose={setIsModalOpen}
          node={selectedNode}
        />
      </div>
    </div>
  );
};

export default DetailExecution;
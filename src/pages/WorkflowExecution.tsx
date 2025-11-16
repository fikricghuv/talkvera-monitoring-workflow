// pages/WorkflowExecution.tsx

import React, { useState, useEffect } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

import { WorkflowExecutionService } from "../services/workflowExecutionService";
import { useDebounce } from "../hooks/useDebounce";
import { useWorkflowExecutionData } from "../hooks/useWorkflowExecutionData";
import { WorkflowExecution, FilterState, PaginationState } from "../types/workflowExecution";
import { EXECUTION_CONSTANTS } from "../constants/workflowExecution";
import { generateExecutionCSV, downloadCSV } from "../utils/workflowExecutionUtils";

import { WorkflowExecutionSkeleton } from "../components/workflowExecution/WorkflowExecutionSkeleton";
import { WorkflowExecutionHeader } from "../components/workflowExecution/WorkflowExecutionHeader";
import { WorkflowExecutionMetrics } from "../components/workflowExecution/WorkflowExecutionMetrics";
import { WorkflowExecutionFilters } from "../components/workflowExecution/WorkflowExecutionFilters";
import { WorkflowExecutionTable } from "../components/workflowExecution/WorkflowExecutionTable";
import { PaginationControls } from "@/components/PaginationControls";
import { WorkflowExecutionDetailModal } from "../components/workflowExecution/WorkflowExecutionDetailModal";

/**
 * Main page component untuk Workflow Execution
 */
const WorkflowExecutionPage: React.FC = () => {
  // ========== STATE MANAGEMENT ==========
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(
    searchTerm, 
    EXECUTION_CONSTANTS.DEBOUNCE_DELAY, 
    EXECUTION_CONSTANTS.MIN_SEARCH_LENGTH
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(EXECUTION_CONSTANTS.DEFAULT_ITEMS_PER_PAGE);

  // Modal States
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ========== PREPARE DATA FOR HOOKS ==========
  
  const filters: FilterState = {
    searchTerm,
    debouncedSearchTerm,
    statusFilter,
    startDate,
    endDate,
  };

  const pagination: PaginationState = {
    currentPage,
    itemsPerPage,
  };

  // ========== FETCH DATA ==========
  
  const { executions, totalCount, kpiData, isLoading, refetch } = useWorkflowExecutionData(
    filters,
    pagination
  );

  // ========== EFFECTS ==========
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, startDate, endDate]);

  // ========== EVENT HANDLERS ==========
  
  /**
   * Handle klik pada row tabel untuk membuka detail modal
   */
  const handleRowClick = (execution: WorkflowExecution) => {
    setSelectedExecution(execution);
    setIsModalOpen(true);
  };

  /**
   * Handle perubahan halaman pagination
   */
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle perubahan jumlah item per halaman
   */
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  /**
   * Handle refresh data
   */
  const handleRefresh = () => {
    toast.info("Memuat ulang data...");
    refetch();
  };

  /**
   * Handle download report CSV
   */
  const handleDownloadReport = async () => {
    try {
      toast.info("Mengunduh report...");
      
      const executions = await WorkflowExecutionService.exportExecutions(filters);
      const csvContent = generateExecutionCSV(executions);
      const filename = `workflow_execution_${format(new Date(), EXECUTION_CONSTANTS.DATE_FORMAT.FILE)}.csv`;
      
      downloadCSV(csvContent, filename);
      toast.success("Report berhasil diunduh!");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Terjadi kesalahan saat mengunduh report");
    }
  };

  /**
   * Handle reset filter tanggal
   */
  const handleResetDates = () => {
    setStartDate("");
    setEndDate("");
  };

  // ========== COMPUTED VALUES ==========
  
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);
  const hasFilters = searchTerm.length > 0 || statusFilter !== "all";

  // ========== RENDER ==========
  
  // Show skeleton on initial load
  if (isLoading && executions.length === 0) {
    return <WorkflowExecutionSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <WorkflowExecutionHeader />

        {/* KPI Metrics */}
        <WorkflowExecutionMetrics kpiData={kpiData} />

        {/* Filters */}
        <WorkflowExecutionFilters
          filters={filters}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onResetDates={handleResetDates}
        />

        {/* Data Table */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Riwayat Eksekusi ({totalCount})</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Menampilkan {totalCount > 0 ? startIndex + 1 : 0}-{endIndex} dari {totalCount} data
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={handleDownloadReport}
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                disabled={totalCount === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <WorkflowExecutionTable
                executions={executions}
                isLoading={isLoading}
                hasFilters={hasFilters}
                onRowClick={handleRowClick}
              />
            </div>

            {/* Pagination Controls */}
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
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <WorkflowExecutionDetailModal
          execution={selectedExecution}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default WorkflowExecutionPage;
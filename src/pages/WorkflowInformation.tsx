// pages/WorkflowInformation.tsx

import React, { useState, useEffect } from "react";
import { Download, RefreshCw, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

import { WorkflowInformationService } from "../services/workflowInformationService";
import { useDebounce } from "../hooks/useDebounce";
import { useWorkflowInformationData } from "../hooks/useWorkflowInformationData";
import { WorkflowInfo, FilterState, PaginationState } from "../types/workflowInformation";
import { WORKFLOW_CONSTANTS } from "../constants/workflowInformation";
import { generateWorkflowCSV, downloadCSV } from "../utils/workflowInformationUtils";

import { WorkflowInformationSkeleton } from "../components/workflowInformation/WorkflowInformationSkeleton";
import { WorkflowInformationHeader } from "../components/workflowInformation/WorkflowInformationHeader";
import { WorkflowInformationMetrics } from "../components/workflowInformation/WorkflowInformationMetrics";
import { WorkflowInformationFilters } from "../components/workflowInformation/WorkflowInformationFilters";
import { WorkflowInformationTable } from "../components/workflowInformation/WorkflowInformationTable";
import { PaginationControls } from "../components/PaginationControls";
import { WorkflowInformationDetailModal } from "../components/workflowInformation/WorkflowInformationDetailModal";

/**
 * Main page component untuk Workflow Information
 */
const WorkflowInformation: React.FC = () => {
  // ========== STATE MANAGEMENT ==========
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(
    searchTerm, 
    WORKFLOW_CONSTANTS.DEBOUNCE_DELAY, 
    WORKFLOW_CONSTANTS.MIN_SEARCH_LENGTH
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(Number(WORKFLOW_CONSTANTS.DEFAULT_ITEMS_PER_PAGE));

  // Modal States
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);

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
  
  const { workflows, totalCount, kpiData, isLoading, refetch } = useWorkflowInformationData(
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
  const handleRowClick = (workflow: WorkflowInfo) => {
    setSelectedWorkflow(workflow);
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
   * Handle process workflow data via webhook
   */
  const handleProcessWorkflows = async () => {
    setIsProcessing(true);
    try {
      toast.info("Memproses data workflow...");
      
      await WorkflowInformationService.triggerWorkflowProcess();
      
      toast.success("Proses berhasil dijalankan!");
      
      // Refresh data setelah 2 detik
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (error) {
      console.error("Error processing workflows:", error);
      toast.error("Terjadi kesalahan saat memproses workflow");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle download report CSV
   */
  const handleDownloadReport = async () => {
    try {
      toast.info("Mengunduh report...");
      
      const workflows = await WorkflowInformationService.exportWorkflows(filters);
      const csvContent = generateWorkflowCSV(workflows);
      const filename = `workflow_information_${format(new Date(), WORKFLOW_CONSTANTS.DATE_FORMAT.FILE)}.csv`;
      
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
  if (isLoading && workflows.length === 0) {
    return <WorkflowInformationSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <WorkflowInformationHeader />

        {/* KPI Metrics */}
        <WorkflowInformationMetrics kpiData={kpiData} />

        {/* Filters */}
        <WorkflowInformationFilters
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
              <CardTitle>Daftar Workflow ({totalCount})</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Menampilkan {totalCount > 0 ? startIndex + 1 : 0}-{endIndex} dari {totalCount} data
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleProcessWorkflows}
                variant="outline" 
                size="sm" 
                disabled={isProcessing || isLoading}
              >
                <Play className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-pulse' : ''}`} />
                {isProcessing ? 'Processing...' : 'Process'}
              </Button>
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
              <WorkflowInformationTable
                workflows={workflows}
                isLoading={isLoading}
                hasFilters={hasFilters}
                onRowClick={handleRowClick}
              />
            </div>
            
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
        <WorkflowInformationDetailModal
          workflow={selectedWorkflow}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default WorkflowInformation;
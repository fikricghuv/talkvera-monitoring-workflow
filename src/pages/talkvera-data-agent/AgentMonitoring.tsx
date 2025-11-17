// src/pages/AgentMonitoring.tsx

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { QueryWithDetails, QueryMonitoringFilters } from '@/types/agentMonitoring';
import { MONITORING_CONSTANTS } from '@/constants/agentMonitoring';
import { useDebounce } from '@/hooks/useDebounce';
import { useAgentMonitoring } from '@/hooks/useAgentMonitoring';
import { fetchAllQueries } from '@/services/agentMonitoringService';
import { generateQueryCSV, downloadQueryCSV } from '@/utils/agentMonitoringUtils';

// Components
import { AgentMonitoringSkeleton } from '@/components/talkveraDataAgent/AgentMonitoringSkeleton';
import { AgentMonitoringHeader } from '@/components/talkveraDataAgent/AgentMonitoringHeader';
import { AgentMonitoringKPI } from '@/components/talkveraDataAgent/AgentMonitoringKPI'
import { AgentMonitoringFilters as AgentFiltersComponent } from '@/components/talkveraDataAgent/AgentMonitoringFilters';
import { AgentMonitoringTable } from '@/components/talkveraDataAgent/AgentMonitoringTable';
import { AgentQueryDetailModal } from '@/components/talkveraDataAgent/AgentQueryDetailModal';

/**
 * Main query monitoring page component
 */
const AgentMonitoring = () => {
  // ========== STATE MANAGEMENT ==========
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(
    searchTerm,
    MONITORING_CONSTANTS.DEBOUNCE_DELAY,
    MONITORING_CONSTANTS.MIN_SEARCH_LENGTH
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(MONITORING_CONSTANTS.DEFAULT_PAGE_SIZE);

  // Modal States
  const [selectedQuery, setSelectedQuery] = useState<QueryWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ========== PREPARE FILTERS FOR HOOKS ==========
  
  const filters: QueryMonitoringFilters = {
    searchTerm: debouncedSearchTerm,
    statusFilter,
    methodFilter,
    riskFilter,
    startDate,
    endDate,
  };

  // ========== FETCH DATA ==========
  
  const {
    queries,
    totalCount,
    kpiData,
    isLoading,
    isLoadingKPI,
    refreshData,
  } = useAgentMonitoring(currentPage, itemsPerPage, filters);

  // ========== EFFECTS ==========
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, methodFilter, riskFilter, startDate, endDate]);

  // ========== EVENT HANDLERS ==========
  
  /**
   * Handle click on table row to open detail modal
   */
  const handleRowClick = (query: QueryWithDetails) => {
    setSelectedQuery(query);
    setIsModalOpen(true);
  };

  /**
   * Handle page change in pagination
   */
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle items per page change
   */
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  /**
   * Handle data refresh
   */
  const handleRefresh = () => {
    toast.info("Memuat ulang data...");
    refreshData();
  };

  /**
   * Handle download CSV report
   */
  const handleDownloadReport = async () => {
    try {
      toast.info("Mengunduh report...");

      const allQueries = await fetchAllQueries(filters);

      if (allQueries.length === 0) {
        toast.warning('Tidak ada data untuk diunduh');
        return;
      }

      const csvContent = generateQueryCSV(allQueries);
      const filename = `agent_queries_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`;
      
      downloadQueryCSV(csvContent, filename);
      toast.success(`Report berhasil diunduh (${allQueries.length} baris)`);
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Terjadi kesalahan saat mengunduh report");
    }
  };

  /**
   * Handle reset all filters
   */
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setMethodFilter("all");
    setRiskFilter("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // ========== COMPUTED VALUES ==========
  
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const hasFilters = searchTerm.length > 0 || 
                     statusFilter !== "all" || 
                     methodFilter !== "all" || 
                     riskFilter !== "all" ||
                     startDate.length > 0 ||
                     endDate.length > 0;

  // ========== RENDER ==========
  
  // Show loading skeleton on initial load
  if (isLoading && currentPage === 1 && queries.length === 0) {
    return <AgentMonitoringSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <AgentMonitoringHeader />

        {/* KPI Cards */}
        <AgentMonitoringKPI kpiData={kpiData} />

        {/* Filters */}
        <AgentFiltersComponent
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          methodFilter={methodFilter}
          setMethodFilter={setMethodFilter}
          riskFilter={riskFilter}
          setRiskFilter={setRiskFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          resetFilters={handleResetFilters}
        />

        {/* Table */}
        <AgentMonitoringTable
          queries={queries}
          totalCount={totalCount}
          isLoading={isLoading}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          hasFilters={hasFilters}
          onRowClick={handleRowClick}
          onRefresh={handleRefresh}
          onDownload={handleDownloadReport}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />

        {/* Detail Modal */}
        <AgentQueryDetailModal
          query={selectedQuery}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default AgentMonitoring;
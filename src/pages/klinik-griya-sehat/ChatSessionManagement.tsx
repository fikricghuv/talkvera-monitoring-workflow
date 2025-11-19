import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ChatSession } from "@/types/chatSessions";
import { useChatSessions } from "@/hooks/useChatSessions";
import { ChatSessionSkeleton } from "@/components/klinikGriyaSehat/chatSession/ChatSessionSkeleton";
import { ChatSessionHeader } from "@/components/klinikGriyaSehat/chatSession/ChatSessionHeader";
import { ChatSessionMetrics } from "@/components/klinikGriyaSehat/chatSession/ChatSessionMetrics";
import { ChatSessionFilters } from "@/components/klinikGriyaSehat/chatSession/ChatSessionFilters";
import { ChatSessionTable } from "@/components/klinikGriyaSehat/chatSession/ChatSessionTable";
import { ChatSessionDetailModal } from "@/components/klinikGriyaSehat/chatSession/ChatSessionDetailModal";

const ChatSessionManagement = () => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Modal State
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, startDate, endDate]);

  // Custom hook for fetching data
  const {
    sessions,
    metrics,
    isLoading,
    totalCount,
    uniqueStatuses,
    refetch,
    updateSessionStatus
  } = useChatSessions(
    { searchTerm, debouncedSearchTerm, statusFilter, startDate, endDate },
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

  const handleRowClick = (session: ChatSession) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    updateSessionStatus(id, newStatus);
  };

  if (isLoading && currentPage === 1) {
    return <ChatSessionSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <ChatSessionHeader />

        <ChatSessionMetrics metrics={metrics} />

        <ChatSessionFilters
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

        <ChatSessionTable
          sessions={sessions}
          isLoading={isLoading}
          totalCount={totalCount}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          onRefresh={handleRefresh}
          onRowClick={handleRowClick}
          onUpdateStatus={handleUpdateStatus}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />

        <ChatSessionDetailModal
          isOpen={isModalOpen}
          onClose={setIsModalOpen}
          session={selectedSession}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  );
};

export default ChatSessionManagement;
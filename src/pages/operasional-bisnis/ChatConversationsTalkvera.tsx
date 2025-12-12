import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChatConversation } from "@/types/chatConversations";
import { useChatConversations } from "@/hooks/useChatConversations";
import { ChatConversationsSkeleton } from "@/components/operasionalBisnis/chatConversations/ChatConversationsSkeleton";
import { ChatConversationsHeader } from "@/components/operasionalBisnis/chatConversations/ChatConversationsHeader";
import { ChatConversationsMetrics } from "@/components/operasionalBisnis/chatConversations/ChatConversationsMetrics";
import { ChatConversationsFilters } from "@/components/operasionalBisnis/chatConversations/ChatConversationsFilters";
import { ChatConversationsTable } from "@/components/operasionalBisnis/chatConversations/ChatConversationsTable";
import { ChatConversationDetailModal } from "@/components/operasionalBisnis/chatConversations/ChatConversationsDetailModal";

const ChatConversationsManagement = () => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [feedbackFilter, setFeedbackFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Modal State
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
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
  }, [debouncedSearchTerm, feedbackFilter, sourceFilter, startDate, endDate]);

  // Custom hook for fetching data
  const {
    conversations,
    metrics,
    isLoading,
    totalCount,
    refetch
  } = useChatConversations(
    { 
      searchTerm, 
      debouncedSearchTerm, 
      feedbackFilter,
      sourceFilter,
      startDate, 
      endDate 
    },
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

  const handleRowClick = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    setIsModalOpen(true);
  };

  const handleUpdateFeedback = async (
    id: string, 
    feedback: 'like' | 'dislike' | null
  ) => {
    try {
      // Update di tabel dt_lp_chat_messages (hanya LP yang punya feedback)
      const { error } = await supabase
        .from("dt_lp_chat_messages")
        .update({ feedback })
        .eq("id", id);

      if (error) throw error;

      toast.success("Feedback berhasil diupdate");
      refetch();
    } catch (error) {
      console.error("Error updating feedback:", error);
      toast.error("Gagal mengupdate feedback");
    }
  };

  if (isLoading && currentPage === 1) {
    return <ChatConversationsSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <ChatConversationsHeader />

        <ChatConversationsMetrics metrics={metrics} />

        <ChatConversationsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          feedbackFilter={feedbackFilter}
          setFeedbackFilter={setFeedbackFilter}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        <ChatConversationsTable
          conversations={conversations}
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

        <ChatConversationDetailModal
          isOpen={isModalOpen}
          onClose={setIsModalOpen}
          conversation={selectedConversation}
          onUpdateFeedback={handleUpdateFeedback}
        />
      </div>
    </div>
  );
};

export default ChatConversationsManagement;
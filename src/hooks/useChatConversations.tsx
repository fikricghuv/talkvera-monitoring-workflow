import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ChatMessage,
  ChatConversation,
  ChatConversationMetrics, 
  ChatConversationFilterState 
} from "@/types/chatConversations";
import { isMessageToday } from "@/utils/chatConversationsUtils";

export const useChatConversations = (
  filters: ChatConversationFilterState,
  currentPage: number,
  itemsPerPage: number
) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [metrics, setMetrics] = useState<ChatConversationMetrics>({
    totalConversations: 0,
    totalMessages: 0,
    todayConversations: 0,
    conversationsWithFeedback: 0,
    avgMessagesPerConversation: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const applyCommonFilters = (query: any) => {
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

    return query;
  };

  const fetchMetrics = async (allConversations: ChatConversation[]) => {
    const totalConversations = allConversations.length;
    const totalMessages = allConversations.reduce((sum, c) => sum + c.total_messages, 0);
    const todayConversations = allConversations.filter(
      c => isMessageToday(c.last_message_time)
    ).length;
    const conversationsWithFeedback = allConversations.filter(
      c => c.messages_with_feedback > 0
    ).length;
    const avgMessagesPerConversation = totalConversations > 0 
      ? Math.round(totalMessages / totalConversations) 
      : 0;

    setMetrics({
      totalConversations,
      totalMessages,
      todayConversations,
      conversationsWithFeedback,
      avgMessagesPerConversation
    });
  };

  const fetchChatConversations = async () => {
    setIsLoading(true);

    try {
      // Fetch all messages with filters
      let query = supabase
        .from("chat_messages" as any)
        .select("*");

      query = applyCommonFilters(query);

      if (filters.feedbackFilter !== "all") {
        if (filters.feedbackFilter === "none") {
          query = query.is("feedback", null);
        } else {
          query = query.eq("feedback", filters.feedbackFilter);
        }
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const allMessages: ChatMessage[] = (data as ChatMessage[]) || [];

      // Group messages by sender_id
      const conversationMap = new Map<string, ChatConversation>();

      allMessages.forEach(message => {
        const existing = conversationMap.get(message.sender_id);

        if (!existing) {
          conversationMap.set(message.sender_id, {
            sender_id: message.sender_id,
            total_messages: 1,
            last_message: message.message,
            last_message_time: message.created_at,
            first_message_time: message.created_at,
            agent_messages: message.role === 'agent' ? 1 : 0,
            user_messages: message.role === 'user' ? 1 : 0,
            messages_with_feedback: message.feedback ? 1 : 0
          });
        } else {
          existing.total_messages += 1;
          if (message.role === 'agent') existing.agent_messages += 1;
          if (message.role === 'user') existing.user_messages += 1;
          if (message.feedback) existing.messages_with_feedback += 1;
          
          // Update first message time (oldest)
          if (new Date(message.created_at) < new Date(existing.first_message_time)) {
            existing.first_message_time = message.created_at;
          }
          
          // last_message and last_message_time already set from first (most recent) message
        }
      });

      let allConversations = Array.from(conversationMap.values());

      // Sort by last message time (most recent first)
      allConversations.sort((a, b) => 
        new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      );

      // Client-side filtering untuk search
      if (filters.debouncedSearchTerm && filters.debouncedSearchTerm.length >= 3) {
        const searchLower = filters.debouncedSearchTerm.toLowerCase();
        allConversations = allConversations.filter(c => {
          const senderId = c.sender_id?.toLowerCase() || '';
          const lastMessage = c.last_message?.toLowerCase() || '';
          
          return senderId.includes(searchLower) || lastMessage.includes(searchLower);
        });
      }

      const totalFiltered = allConversations.length;
      
      // Client-side pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage;
      const paginatedData = allConversations.slice(from, to);

      setConversations(paginatedData);
      setTotalCount(totalFiltered);

      await fetchMetrics(allConversations);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching chat conversations:", error);
      toast.error("Gagal memuat data chat conversations");
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchChatConversations();
  };

  useEffect(() => {
    fetchChatConversations();
  }, [
    currentPage,
    itemsPerPage,
    filters.debouncedSearchTerm,
    filters.feedbackFilter,
    filters.startDate,
    filters.endDate
  ]);

  return {
    conversations,
    metrics,
    isLoading,
    totalCount,
    refetch
  };
};
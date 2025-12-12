import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ChatConversation,
  ChatConversationMetrics, 
  ChatConversationFilterState,
  LPChatMessage,
  WAChatMessage,
  UnifiedMessage
} from "@/types/chatConversations";
import { isMessageToday } from "@/utils/chatConversationsUtils";

export const useChatConversations = (
  filters: ChatConversationFilterState,
  currentPage: number,
  itemsPerPage: number
) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [metrics, setMetrics] = useState<ChatConversationMetrics>({
    totalSessions: 0,
    totalMessages: 0,
    todaySessions: 0,
    sessionsWithFeedback: 0,
    avgMessagesPerSession: 0,
    landingPageSessions: 0,
    whatsappSessions: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const applyDateFilters = (query: any) => {
    if (filters.startDate) {
      const startDateTime = new Date(filters.startDate);
      startDateTime.setHours(0, 0, 0, 0);
      query = query.gte("start_time", startDateTime.toISOString());
    }

    if (filters.endDate) {
      const endDateTime = new Date(filters.endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte("start_time", endDateTime.toISOString());
    }

    return query;
  };

  const fetchMetrics = async (allConversations: ChatConversation[]) => {
    const totalSessions = allConversations.length;
    const totalMessages = allConversations.reduce((sum, c) => sum + c.total_messages, 0);
    const todaySessions = allConversations.filter(
      c => isMessageToday(c.last_message_time)
    ).length;
    const sessionsWithFeedback = allConversations.filter(
      c => c.messages_with_feedback > 0
    ).length;
    const avgMessagesPerSession = totalSessions > 0 
      ? Math.round(totalMessages / totalSessions) 
      : 0;
    const landingPageSessions = allConversations.filter(
      c => c.source === 'landing_page'
    ).length;
    const whatsappSessions = allConversations.filter(
      c => c.source === 'whatsapp'
    ).length;

    setMetrics({
      totalSessions,
      totalMessages,
      todaySessions,
      sessionsWithFeedback,
      avgMessagesPerSession,
      landingPageSessions,
      whatsappSessions
    });
  };

  const fetchChatConversations = async () => {
    setIsLoading(true);

    try {
      // 1. Fetch sessions dengan filter
      let sessionQuery = supabase
        .from("dt_chat_sessions")
        .select("*");

      sessionQuery = applyDateFilters(sessionQuery);

      // Filter by source
      if (filters.sourceFilter && filters.sourceFilter !== "all") {
        sessionQuery = sessionQuery.eq("source", filters.sourceFilter);
      }

      // Order awal session (optional, tapi bagus untuk mempercepat query)
      sessionQuery = sessionQuery.order("start_time", { ascending: false });

      const { data: sessions, error: sessionError } = await sessionQuery;

      if (sessionError) throw sessionError;

      if (!sessions || sessions.length === 0) {
        setConversations([]);
        setTotalCount(0);
        setMetrics({
          totalSessions: 0,
          totalMessages: 0,
          todaySessions: 0,
          sessionsWithFeedback: 0,
          avgMessagesPerSession: 0,
          landingPageSessions: 0,
          whatsappSessions: 0
        });
        setIsLoading(false);
        return;
      }

      const sessionIds = sessions.map(s => s.id);

      // 2. Fetch messages dari kedua tabel
      const [lpMessages, waMessages] = await Promise.all([
        supabase
          .from("dt_lp_chat_messages")
          .select("*")
          .in("session_id", sessionIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("dt_wa_chat_messages")
          .select("*")
          .in("session_id", sessionIds)
          .order("timestamp", { ascending: false })
      ]);

      if (lpMessages.error) throw lpMessages.error;
      if (waMessages.error) throw waMessages.error;

      // 3. Transform dan gabungkan messages
      const allMessages: UnifiedMessage[] = [
        ...(lpMessages.data || []).map((msg: LPChatMessage) => ({
          id: msg.id,
          session_id: msg.session_id,
          role: msg.role,
          message: msg.message,
          created_at: msg.created_at,
          feedback: msg.feedback,
          feedback_text: msg.feedback_text,
          source: 'landing_page' as const
        })),
        ...(waMessages.data || []).map((msg: WAChatMessage) => ({
          id: msg.id,
          session_id: msg.session_id,
          role: msg.sender_type === 'BOT' ? 'agent' as const : 'user' as const,
          message: msg.message_content || '',
          created_at: msg.timestamp,
          feedback: null,
          feedback_text: null,
          source: 'whatsapp' as const
        }))
      ];

      // 4. Group messages by session dan buat conversation objects
      const conversationMap = new Map<string, ChatConversation>();

      sessions.forEach(session => {
        const sessionMessages = allMessages.filter(m => m.session_id === session.id);
        
        if (sessionMessages.length === 0) {
          // Session tanpa message (gunakan data default)
          conversationMap.set(session.id, {
            session_id: session.id,
            sender_id: session.sender_id,
            source: session.source,
            total_messages: session.total_messages,
            last_message: '',
            last_message_time: session.start_time, // Fallback ke start time
            first_message_time: session.start_time,
            agent_messages: 0,
            user_messages: 0,
            messages_with_feedback: 0,
            status: session.status,
            contact_id: session.contact_id
          });
        } else {
          // Sort messages by time desc (terbaru di index 0)
          sessionMessages.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          const agentCount = sessionMessages.filter(m => m.role === 'agent').length;
          const userCount = sessionMessages.filter(m => m.role === 'user').length;
          const feedbackCount = sessionMessages.filter(m => m.feedback).length;

          conversationMap.set(session.id, {
            session_id: session.id,
            sender_id: session.sender_id,
            source: session.source,
            total_messages: sessionMessages.length,
            last_message: sessionMessages[0].message,
            last_message_time: sessionMessages[0].created_at, // Waktu pesan terakhir real
            first_message_time: sessionMessages[sessionMessages.length - 1].created_at,
            agent_messages: agentCount,
            user_messages: userCount,
            messages_with_feedback: feedbackCount,
            status: session.status,
            contact_id: session.contact_id
          });
        }
      });

      let allConversations = Array.from(conversationMap.values());

      // 5. Filter by feedback
      if (filters.feedbackFilter !== "all") {
        allConversations = allConversations.filter(conv => {
          if (filters.feedbackFilter === "none") {
            return conv.messages_with_feedback === 0;
          } else {
            const convMessages = allMessages.filter(m => 
              m.session_id === conv.session_id && 
              m.feedback === filters.feedbackFilter
            );
            return convMessages.length > 0;
          }
        });
      }

      // 6. Client-side search filtering
      if (filters.debouncedSearchTerm && filters.debouncedSearchTerm.length >= 3) {
        const searchLower = filters.debouncedSearchTerm.toLowerCase();
        allConversations = allConversations.filter(c => {
          const senderId = c.sender_id?.toLowerCase() || '';
          const lastMessage = c.last_message?.toLowerCase() || '';
          return senderId.includes(searchLower) || lastMessage.includes(searchLower);
        });
      }

      // ---------------------------------------------------------
      // 6.5. Sorting: Urutkan berdasarkan last_message_time (Terbaru di atas)
      // ---------------------------------------------------------
      allConversations.sort((a, b) => 
        new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      );

      const totalFiltered = allConversations.length;
      
      // 7. Client-side pagination
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
    filters.sourceFilter,
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
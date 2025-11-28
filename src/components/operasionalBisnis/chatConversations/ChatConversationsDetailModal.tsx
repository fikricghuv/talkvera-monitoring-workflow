import { useState, useEffect, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ThumbsUp, ThumbsDown, ChevronUp } from "lucide-react";
import { ChatConversation, ChatMessage } from "@/types/chatConversations";
import { formatMessageDateLong, formatMessageTime, calculateDuration } from "@/utils/chatConversationsUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatConversationDetailModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  conversation: ChatConversation | null;
  onUpdateFeedback: (id: string, feedback: 'like' | 'dislike' | null) => void;
}

export const ChatConversationDetailModal = ({ 
  isOpen, 
  onClose, 
  conversation,
  onUpdateFeedback 
}: ChatConversationDetailModalProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);
  
  const MESSAGES_PER_PAGE = 10; // Changed to 10 messages per page

  useEffect(() => {
    if (isOpen && conversation) {
      // Reset state saat modal dibuka
      setMessages([]);
      setPage(0);
      setHasMore(true);
      setTotalMessages(0);
      loadMessages(0, true);
    }
  }, [isOpen, conversation?.sender_id]);

  useEffect(() => {
    // Scroll ke bawah saat pertama kali load atau ada perubahan pada initial messages
    if (messages.length > 0 && page === 0) {
      scrollToBottom();
    }
  }, [messages.length, page]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      }
    }, 150);
  };

  const loadMessages = async (pageNum: number, isInitial: boolean = false) => {
    if (!conversation || isLoadingMessages) return;

    setIsLoadingMessages(true);

    try {
      const from = pageNum * MESSAGES_PER_PAGE;
      const to = from + MESSAGES_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from("chat_messages" as any)
        .select("*", { count: 'exact' })
        .eq("sender_id", conversation.sender_id)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        const newMessages = data as ChatMessage[];
        
        // Store previous scroll position
        if (chatContainerRef.current && !isInitial) {
          previousScrollHeight.current = chatContainerRef.current.scrollHeight;
        }
        
        if (isInitial) {
          // Untuk load pertama, reverse untuk urutan terlama ke terbaru
          setMessages(newMessages.reverse());
          // Force scroll to bottom pada initial load
          setTimeout(() => scrollToBottom(), 200);
        } else {
          // Untuk load more (scroll ke atas), tambahkan di depan
          setMessages(prev => [...newMessages.reverse(), ...prev]);
        }

        // Set total messages
        setTotalMessages(count || 0);

        // Check apakah masih ada data
        const totalLoaded = (pageNum + 1) * MESSAGES_PER_PAGE;
        setHasMore(totalLoaded < (count || 0));

        // Maintain scroll position after loading more
        if (chatContainerRef.current && !isInitial) {
          setTimeout(() => {
            if (chatContainerRef.current) {
              const newScrollHeight = chatContainerRef.current.scrollHeight;
              const scrollDiff = newScrollHeight - previousScrollHeight.current;
              chatContainerRef.current.scrollTop = scrollDiff;
            }
          }, 50);
        }
      }

      setIsLoadingMessages(false);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Gagal memuat pesan");
      setIsLoadingMessages(false);
    }
  };

  const handleScroll = () => {
    if (!chatContainerRef.current || isLoadingMessages || !hasMore) return;

    const { scrollTop } = chatContainerRef.current;

    // Jika scroll sudah di atas (scrollTop mendekati 0), load more
    if (scrollTop < 100) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(nextPage);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMessages && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(nextPage);
    }
  };

  const handleFeedbackUpdate = async (messageId: string, currentFeedback: string | null | undefined) => {
    let newFeedback: 'like' | 'dislike' | null = null;
    
    if (currentFeedback === 'like') {
      newFeedback = null; // Remove like
    } else if (currentFeedback === 'dislike') {
      newFeedback = null; // Remove dislike
    } else {
      newFeedback = 'like'; // Default to like when no feedback
    }
    
    onUpdateFeedback(messageId, newFeedback);
    
    // Update local state
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback: newFeedback } : msg
    ));
  };

  if (!conversation) return null;

  const loadedMessages = messages.length;
  const remainingMessages = totalMessages - loadedMessages;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Detail Percakapan</DialogTitle>
          <DialogDescription>
            History lengkap percakapan dengan {conversation.sender_id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 p-4 bg-gray-50 rounded-lg">
          {/* Summary Section */}
          <div className="bg-white p-5 rounded-lg shadow border-2 border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">Ringkasan Percakapan</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <DetailItem 
                title="Sender ID" 
                value={
                  <span className="font-mono text-lg font-bold text-indigo-700">
                    {conversation.sender_id}
                  </span>
                } 
              />
              <DetailItem 
                title="Total Pesan" 
                value={
                  <Badge className="text-lg px-3 py-1 bg-blue-100 text-blue-800">
                    {conversation.total_messages}
                  </Badge>
                } 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <DetailItem 
                title="Waktu Pertama" 
                value={
                  <span className="font-medium text-sm">
                    {formatMessageDateLong(conversation.first_message_time)}
                  </span>
                } 
              />
              <DetailItem 
                title="Waktu Terakhir" 
                value={
                  <span className="font-medium text-sm">
                    {formatMessageDateLong(conversation.last_message_time)}
                  </span>
                } 
              />
              <DetailItem 
                title="Durasi" 
                value={
                  <span className="font-semibold text-blue-600">
                    {calculateDuration(conversation.first_message_time, conversation.last_message_time)}
                  </span>
                } 
              />
              <DetailItem 
                title="Pesan dgn Feedback" 
                value={
                  <Badge className="bg-pink-100 text-pink-800">
                    {conversation.messages_with_feedback}
                  </Badge>
                } 
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <DetailItem 
                title="Pesan Agent" 
                value={
                  <Badge className="bg-purple-100 text-purple-800 text-base px-3 py-1">
                    🤖 {conversation.agent_messages}
                  </Badge>
                } 
              />
              <DetailItem 
                title="Pesan User" 
                value={
                  <Badge className="bg-green-100 text-green-800 text-base px-3 py-1">
                    👤 {conversation.user_messages}
                  </Badge>
                } 
              />
            </div>
          </div>

          {/* Chat History Section */}
          <div className="bg-white rounded-lg shadow border-2 border-gray-200 overflow-hidden flex flex-col h-[500px]">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">History Chat</h3>
                  <p className="text-xs opacity-90">
                    Menampilkan {loadedMessages} dari {totalMessages} pesan
                  </p>
                </div>
                {hasMore && (
                  <Badge className="bg-white/20 text-white border-white/30">
                    +{remainingMessages} pesan lagi
                  </Badge>
                )}
              </div>
            </div>

            {/* Chat Container with Infinite Scroll */}
            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
              style={{ 
                backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
              }}
            >
              {/* Load More Button - at top */}
              {hasMore && messages.length > 0 && (
                <div className="flex justify-center pb-3 sticky top-0 z-10 bg-gray-50 pt-2">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoadingMessages}
                    variant="outline"
                    size="sm"
                    className="shadow-md hover:shadow-lg transition-shadow bg-white"
                  >
                    {isLoadingMessages ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Memuat...
                      </>
                    ) : (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Muat {Math.min(MESSAGES_PER_PAGE, remainingMessages)} Pesan Sebelumnya
                      </>
                    )}
                  </Button>
                </div>
              )}

              {!hasMore && messages.length > 0 && (
                <div className="text-center py-2 sticky top-0 z-10 bg-gray-50">
                  <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">
                    📨 Awal percakapan ({totalMessages} pesan total)
                  </span>
                </div>
              )}

              {messages.length === 0 && !isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-sm">Tidak ada pesan dalam percakapan ini</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <ChatBubble 
                    key={message.id} 
                    message={message}
                    isFirstInGroup={
                      index === 0 || 
                      messages[index - 1].role !== message.role
                    }
                    onFeedbackClick={handleFeedbackUpdate}
                  />
                ))
              )}

              {isLoadingMessages && page === 0 && (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-500">Memuat pesan...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer Info */}
            <div className="bg-gray-100 px-5 py-2 border-t">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  {loadedMessages} / {totalMessages} pesan dimuat
                </span>
                {hasMore && (
                  <span className="text-blue-600 font-medium">
                    Scroll ke atas atau klik tombol untuk muat lebih banyak
                  </span>
                )}
                {!hasMore && messages.length > 0 && (
                  <span className="text-green-600 font-medium">
                    ✓ Semua pesan telah dimuat
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Chat Bubble Component
const ChatBubble = ({ 
  message, 
  isFirstInGroup,
  onFeedbackClick
}: { 
  message: ChatMessage;
  isFirstInGroup: boolean;
  onFeedbackClick: (messageId: string, currentFeedback: string | null | undefined) => void;
}) => {
  const isAgent = message.role === 'agent';

  return (
    <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'} ${isFirstInGroup ? 'mt-4' : 'mt-1'}`}>
      <div className={`max-w-[70%] ${isAgent ? 'order-1' : 'order-2'}`}>
        {isFirstInGroup && (
          <div className={`text-xs font-semibold mb-1 ${isAgent ? 'text-left' : 'text-right'} text-gray-600`}>
            {isAgent ? '🤖 AGENT' : '👤 USER'}
          </div>
        )}
        <div
          className={`
            px-4 py-2.5 rounded-2xl shadow-sm relative group
            ${isAgent 
              ? 'bg-white text-gray-800 border border-gray-200' 
              : 'bg-blue-500 text-white'
            }
            ${isAgent 
              ? 'rounded-tl-none' 
              : 'rounded-tr-none'
            }
          `}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message || '(pesan kosong)'}
          </p>
          
          {/* Feedback Buttons - hanya untuk agent messages */}
          {isAgent && (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFeedbackClick(message.id, message.feedback);
                }}
                className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                  message.feedback === 'like' ? 'bg-green-100' : ''
                }`}
                title={message.feedback === 'like' ? 'Remove like' : 'Like'}
              >
                <ThumbsUp className={`h-3 w-3 ${
                  message.feedback === 'like' ? 'text-green-600 fill-green-600' : 'text-gray-400'
                }`} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newFeedback = message.feedback === 'dislike' ? null : 'dislike';
                  onFeedbackClick(message.id, newFeedback === null ? 'dislike' : null);
                }}
                className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                  message.feedback === 'dislike' ? 'bg-red-100' : ''
                }`}
                title={message.feedback === 'dislike' ? 'Remove dislike' : 'Dislike'}
              >
                <ThumbsDown className={`h-3 w-3 ${
                  message.feedback === 'dislike' ? 'text-red-600 fill-red-600' : 'text-gray-400'
                }`} />
              </button>
              
              {message.feedback_text && (
                <span className="text-xs text-gray-500 ml-2 truncate max-w-[150px]" title={message.feedback_text}>
                  💬 {message.feedback_text}
                </span>
              )}
            </div>
          )}
        </div>
        <div className={`text-xs text-gray-400 mt-1 ${isAgent ? 'text-left' : 'text-right'}`}>
          {formatMessageTime(message.created_at)}
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ title, value }: { title: string; value: React.ReactNode }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
    <div>{value}</div>
  </div>
);
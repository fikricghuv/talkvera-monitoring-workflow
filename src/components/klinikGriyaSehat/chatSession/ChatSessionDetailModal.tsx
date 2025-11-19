import { useState, useEffect, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ChatSession, ChatMessage } from "@/types/chatSessions";
import { ChatStatusBadge } from "./ChatStatusBadge";
import { formatChatDateLong, formatMessageTime, calculateDuration } from "@/utils/chatSessionUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatSessionDetailModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  session: ChatSession | null;
  onUpdateStatus: (id: string, newStatus: string) => void;
}

export const ChatSessionDetailModal = ({ 
  isOpen, 
  onClose, 
  session,
  onUpdateStatus 
}: ChatSessionDetailModalProps) => {
  const [newStatus, setNewStatus] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const MESSAGES_PER_PAGE = 20;

  useEffect(() => {
    if (isOpen && session) {
      // Reset state saat modal dibuka
      setMessages([]);
      setPage(0);
      setHasMore(true);
      loadMessages(0, true);
    }
  }, [isOpen, session?.id]);

  useEffect(() => {
    // Scroll ke bawah saat pertama kali load atau ada pesan baru
    if (messages.length > 0 && page === 0) {
      scrollToBottom();
    }
  }, [messages, page]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async (pageNum: number, isInitial: boolean = false) => {
    if (!session || isLoadingMessages) return;

    setIsLoadingMessages(true);

    try {
      const from = pageNum * MESSAGES_PER_PAGE;
      const to = from + MESSAGES_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from("dt_chat_messages" as any)
        .select("*", { count: 'exact' })
        .eq("session_id", session.id)
        .order("timestamp", { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        const newMessages = data as ChatMessage[];
        
        if (isInitial) {
          // Untuk load pertama, reverse untuk urutan terlama ke terbaru
          setMessages(newMessages.reverse());
        } else {
          // Untuk load more (scroll ke atas), tambahkan di depan
          setMessages(prev => [...newMessages.reverse(), ...prev]);
        }

        // Check apakah masih ada data
        const totalLoaded = (pageNum + 1) * MESSAGES_PER_PAGE;
        setHasMore(totalLoaded < (count || 0));
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

  const handleUpdateStatus = () => {
    if (newStatus && newStatus !== session?.status) {
      onUpdateStatus(session!.id, newStatus);
      setNewStatus("");
      onClose(false);
    }
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Detail Chat Session</DialogTitle>
          <DialogDescription>
            Informasi lengkap dan history chat dari session yang dipilih
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 p-4 bg-gray-50 rounded-lg">
          {/* Summary Section */}
          <div className="bg-white p-5 rounded-lg shadow border-2 border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">Summary Session</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <DetailItem 
                title="Nama Pasien" 
                value={
                  <span className="font-semibold text-lg text-indigo-700">
                    {session.patient?.full_name || 'Belum diisi'}
                  </span>
                } 
              />
              <DetailItem 
                title="WhatsApp" 
                value={
                  <span className="font-mono text-base">
                    {session.patient?.whatsapp_number || '-'}
                  </span>
                } 
              />
              <DetailItem 
                title="Status" 
                value={<ChatStatusBadge status={session.status} />} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <DetailItem 
                title="Waktu Mulai" 
                value={
                  <span className="font-medium text-sm">
                    {formatChatDateLong(session.start_time)}
                  </span>
                } 
              />
              <DetailItem 
                title="Durasi" 
                value={
                  <span className="font-semibold text-blue-600">
                    {calculateDuration(session.start_time, session.end_time)}
                  </span>
                } 
              />
              <DetailItem 
                title="Total Pesan" 
                value={
                  <span className="font-bold text-xl text-green-600">
                    {session.total_messages}
                  </span>
                } 
              />
              <DetailItem 
                title="Final Step" 
                value={
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {session.final_step_reached || '-'}
                  </span>
                } 
              />
            </div>
          </div>

          {/* Chat History Section */}
          <div className="bg-white rounded-lg shadow border-2 border-gray-200 overflow-hidden flex flex-col h-[450px]">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3">
              <h3 className="text-lg font-semibold">History Chat</h3>
              <p className="text-xs opacity-90">Scroll ke atas untuk load pesan sebelumnya</p>
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
              {isLoadingMessages && page > 0 && (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="ml-2 text-sm text-gray-500">Memuat pesan...</span>
                </div>
              )}

              {!hasMore && messages.length > 0 && (
                <div className="text-center py-2">
                  <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">
                    📨 Awal percakapan
                  </span>
                </div>
              )}

              {messages.length === 0 && !isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-sm">Tidak ada pesan dalam session ini</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <ChatBubble 
                    key={message.id} 
                    message={message}
                    isFirstInGroup={
                      index === 0 || 
                      messages[index - 1].sender_type !== message.sender_type
                    }
                  />
                ))
              )}

              {isLoadingMessages && page === 0 && (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Update Status Section */}
          <div className="bg-white p-4 rounded-lg border-2 border-green-200">
            <h3 className="text-lg font-semibold mb-3">Update Status</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Status Baru
                </label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status baru..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                    <SelectItem value="ENDED">ENDED</SelectItem>
                    <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                    <SelectItem value="ERROR">ERROR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleUpdateStatus}
                disabled={!newStatus || newStatus === session.status}
                className="bg-green-600 hover:bg-green-700"
              >
                Update Status
              </Button>
            </div>
            {newStatus && newStatus === session.status && (
              <p className="text-xs text-amber-600 mt-2">
                Status yang dipilih sama dengan status saat ini
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Chat Bubble Component
const ChatBubble = ({ 
  message, 
  isFirstInGroup 
}: { 
  message: ChatMessage;
  isFirstInGroup: boolean;
}) => {
  const isBot = message.sender_type === 'BOT';

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} ${isFirstInGroup ? 'mt-4' : 'mt-1'}`}>
      <div className={`max-w-[70%] ${isBot ? 'order-1' : 'order-2'}`}>
        {isFirstInGroup && (
          <div className={`text-xs font-semibold mb-1 ${isBot ? 'text-left' : 'text-right'} text-gray-600`}>
            {isBot ? '🤖 BOT' : '👤 USER'}
          </div>
        )}
        <div
          className={`
            px-4 py-2.5 rounded-2xl shadow-sm
            ${isBot 
              ? 'bg-white text-gray-800 border border-gray-200' 
              : 'bg-blue-500 text-white'
            }
            ${isBot 
              ? 'rounded-tl-none' 
              : 'rounded-tr-none'
            }
          `}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message_content || '(pesan kosong)'}
          </p>
          {message.context_step && (
            <div className={`text-xs mt-1 pt-1 border-t ${isBot ? 'border-gray-200' : 'border-blue-400 opacity-80'}`}>
              Step: {message.context_step}
            </div>
          )}
        </div>
        <div className={`text-xs text-gray-400 mt-1 ${isBot ? 'text-left' : 'text-right'}`}>
          {formatMessageTime(message.timestamp)}
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
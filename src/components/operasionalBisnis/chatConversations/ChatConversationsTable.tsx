import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChatConversation } from "@/types/chatConversations";
import { formatMessageDate, isMessageToday, getRelativeTime } from "@/utils/chatConversationsUtils";
import { PaginationControls } from "@/components/PaginationControls";

interface ChatConversationsTableProps {
  conversations: ChatConversation[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onRefresh: () => void;
  onRowClick: (conversation: ChatConversation) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
}

export const ChatConversationsTable = ({
  conversations,
  isLoading,
  totalCount,
  currentPage,
  itemsPerPage,
  totalPages,
  onRefresh,
  onRowClick,
  onPageChange,
  onItemsPerPageChange
}: ChatConversationsTableProps) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daftar Percakapan ({totalCount})</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Menampilkan {totalCount > 0 ? startIndex + 1 : 0}-{endIndex} dari {totalCount} percakapan
          </p>
        </div>
        <div>
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50 z-10 border-b">
              <TableRow>
                <TableHead>Sender ID</TableHead>
                <TableHead className="max-w-md">Pesan Terakhir</TableHead>
                <TableHead>Waktu Terakhir</TableHead>
                <TableHead className="text-center">Total Pesan</TableHead>
                <TableHead className="text-center">Agent</TableHead>
                <TableHead className="text-center">User</TableHead>
                <TableHead className="text-center">Feedback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : conversations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Tidak ada data percakapan yang cocok dengan filter.
                  </TableCell>
                </TableRow>
              ) : (
                conversations.map((conversation) => (
                  <TableRow 
                    key={conversation.sender_id} 
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                      isMessageToday(conversation.last_message_time) 
                        ? 'bg-yellow-50/50' 
                        : ''
                    }`}
                    onClick={() => onRowClick(conversation)}
                  >
                    <TableCell className="font-mono text-sm font-semibold">
                      {conversation.sender_id}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate text-sm text-gray-600" title={conversation.last_message}>
                        {conversation.last_message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {getRelativeTime(conversation.last_message_time)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageDate(conversation.last_message_time)}
                        </span>
                        {isMessageToday(conversation.last_message_time) && (
                          <span className="text-xs text-yellow-600 font-semibold mt-1">
                            📅 Hari ini
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 font-bold">
                        {conversation.total_messages}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        {conversation.agent_messages}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {conversation.user_messages}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {conversation.messages_with_feedback > 0 ? (
                        <Badge variant="outline" className="bg-pink-50 text-pink-700">
                          {conversation.messages_with_feedback}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalCount > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            isLoading={isLoading}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        )}
      </CardContent>
    </Card>
  );
};
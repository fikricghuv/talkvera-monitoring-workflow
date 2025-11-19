import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChatSession } from "@/types/chatSessions";
import { ChatStatusBadge } from "./ChatStatusBadge";
import { formatChatDate, isChatToday, calculateDuration } from "@/utils/chatSessionUtils";
import { PaginationControls } from "@/components/PaginationControls";

interface ChatSessionTableProps {
  sessions: ChatSession[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onRefresh: () => void;
  onRowClick: (session: ChatSession) => void;
  onUpdateStatus: (id: string, newStatus: string) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
}

export const ChatSessionTable = ({
  sessions,
  isLoading,
  totalCount,
  currentPage,
  itemsPerPage,
  totalPages,
  onRefresh,
  onRowClick,
  onUpdateStatus,
  onPageChange,
  onItemsPerPageChange
}: ChatSessionTableProps) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  const handleStatusChange = (sessionId: string, newStatus: string) => {
    onUpdateStatus(sessionId, newStatus);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daftar Chat Sessions ({totalCount})</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Menampilkan {totalCount > 0 ? startIndex + 1 : 0}-{endIndex} dari {totalCount} data
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
                <TableHead>Pasien</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Waktu Mulai</TableHead>
                <TableHead>Durasi</TableHead>
                <TableHead>Total Pesan</TableHead>
                <TableHead>Final Step</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Tidak ada data chat session yang cocok dengan filter.
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow 
                    key={session.id} 
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                      isChatToday(session.start_time) 
                        ? 'bg-muted-50/30' 
                        : ''
                    }`}
                    onClick={() => onRowClick(session)}
                  >
                    <TableCell className="font-medium">
                      {session.patient?.full_name || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {session.patient?.whatsapp_number || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatChatDate(session.start_time)}
                        </span>
                        {isChatToday(session.start_time) && (
                          <span className="text-xs text-yellow-600 font-semibold">
                            Hari ini
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {calculateDuration(session.start_time, session.end_time)}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {session.total_messages}
                    </TableCell>
                    <TableCell className="text-xs">
                      {session.final_step_reached || '-'}
                    </TableCell>
                    <TableCell>
                      <ChatStatusBadge status={session.status} />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={session.status}
                        onValueChange={(newStatus) => handleStatusChange(session.id, newStatus)}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
                          <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                          <SelectItem value="ENDED">ENDED</SelectItem>
                          <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                          <SelectItem value="ERROR">ERROR</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
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
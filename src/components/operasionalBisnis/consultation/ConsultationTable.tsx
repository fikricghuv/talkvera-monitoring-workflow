// components/consultation/ConsultationTable.tsx

import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ConsultationRequest } from "@/types/consultationRequests";
import { ConsultationStatusBadge } from "./ConsultationStatusBadge";
import { formatDateTime, isCreatedToday, getCompanySizeLabel } from "@/utils/consultationUtils";
import { PaginationControls } from "@/components/PaginationControls";

interface ConsultationTableProps {
  requests: ConsultationRequest[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onRefresh: () => void;
  onRowClick: (request: ConsultationRequest) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
}

export const ConsultationTable = ({
  requests,
  isLoading,
  totalCount,
  currentPage,
  itemsPerPage,
  totalPages,
  onRefresh,
  onRowClick,
  onPageChange,
  onItemsPerPageChange
}: ConsultationTableProps) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daftar Consultation Request ({totalCount})</CardTitle>
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
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email Sent</TableHead>
                <TableHead>Last Follow Up</TableHead>
                <TableHead>Submitted</TableHead>
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
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Tidak ada data consultation request yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow 
                    key={request.id} 
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                      isCreatedToday(request.submitted_at) ? 'bg-green-50' : ''
                    }`}
                    onClick={() => onRowClick(request)}
                  >
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span>{request.contact?.full_name || '-'}</span>
                          {isCreatedToday(request.submitted_at) && (
                            <span className="text-xs text-green-600 font-semibold">
                              New
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {request.contact?.email || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.contact?.company || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-medium">
                        {getCompanySizeLabel(request.company_size)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">
                      {request.website ? (
                        <a 
                          href={request.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {request.website}
                        </a>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <ConsultationStatusBadge status={request.consultation_status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {request.greetings_email_sent_at ? (
                        formatDateTime(request.greetings_email_sent_at)
                      ) : (
                        <span className="text-gray-400">Belum dikirim</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {request.last_follow_up_at ? (
                        formatDateTime(request.last_follow_up_at)
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(request.submitted_at)}
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
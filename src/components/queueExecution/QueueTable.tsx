import { RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QueueItem } from "@/types/processQueue";
import { QueueStatusBadge } from "./QueueStatusBadge";
import { formatDate } from "@/utils/queueUtils";
import { PaginationControls } from "@/components/PaginationControls";

interface QueueTableProps {
  queueItems: QueueItem[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  debouncedSearchTerm: string;
  statusFilter: string;
  startDate: string;
  endDate: string;
  onRefresh: () => void;
  onRowClick: (item: QueueItem) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
}

export const QueueTable = ({
  queueItems,
  isLoading,
  totalCount,
  currentPage,
  itemsPerPage,
  totalPages,
  debouncedSearchTerm,
  statusFilter,
  startDate,
  endDate,
  onRefresh,
  onRowClick,
  onPageChange,
  onItemsPerPageChange
}: QueueTableProps) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daftar Antrian ({totalCount})</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Menampilkan {totalCount > 0 ? startIndex + 1 : 0}-{endIndex} dari {totalCount} data
          </p>
        </div>
        <div>
          <Button onClick={onRefresh} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium">Execution ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Workflow</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Dibuat</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Diupdate</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : queueItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    {debouncedSearchTerm || statusFilter !== "all" || startDate || endDate
                      ? "Tidak ada data yang sesuai dengan filter"
                      : "Tidak ada item dalam antrian"}
                  </td>
                </tr>
              ) : (
                queueItems.map((item) => (
                  <tr 
                    key={item.id}
                    className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onRowClick(item)}
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {item.execution_id}
                    </td>
                    <td className="px-4 py-3 font-medium">{item.workflow_id}</td>
                    <td className="px-4 py-3">
                      <QueueStatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(item.updated_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - Di dalam CardContent */}
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
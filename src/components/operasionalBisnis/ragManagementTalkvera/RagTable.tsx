// components/ragManagement/RagTable.tsx
import { RefreshCw, FileText, ExternalLink, Trash2, Upload, FileClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RagDocument, RagUrl } from "@/types/ragManagementTalkvera";
import { PaginationControls } from "@/components/PaginationControls";

interface RagTableProps {
  items: (RagDocument | RagUrl)[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  pendingCount: number;
  onRefresh: () => void;
  onRowClick: (item: RagDocument | RagUrl) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
  onDelete: (id: string, item: RagDocument | RagUrl) => void;
  onOpenUploadModal: (type: 'document' | 'url') => void;
  onProcess: () => void;
}

export const RagTable = ({
  items,
  isLoading,
  totalCount,
  currentPage,
  itemsPerPage,
  totalPages,
  pendingCount,
  onRefresh,
  onRowClick,
  onPageChange,
  onItemsPerPageChange,
  onDelete,
  onOpenUploadModal,
  onProcess
}: RagTableProps) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { color: 'bg-amber-100 text-amber-800', label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  const isDocument = (item: RagDocument | RagUrl): item is RagDocument => {
    return 'file_name' in item;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daftar Dokumen & URL ({totalCount})</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Menampilkan {totalCount > 0 ? startIndex + 1 : 0}-{endIndex} dari {totalCount} data
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={onProcess} 
            variant="outline" 
            size="sm" 
            disabled={isLoading || !pendingCount || pendingCount === 0}
            className="mr-2"
          >
            <FileClock className="h-4 w-4 mr-2" />
            Proses Data Pending {pendingCount > 0 ? `(${pendingCount})` : ''}
          </Button>
          <Button 
            onClick={() => onOpenUploadModal('document')}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Dokumen
          </Button>
          <Button 
            onClick={() => onOpenUploadModal('url')}
            className="bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Tambah URL
          </Button>
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
                <TableHead className="w-12">Tipe</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>File/URL</TableHead>
                <TableHead>Ukuran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="w-20">Aksi</TableHead>
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
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Tidak ada data yang cocok dengan filter.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow 
                    key={item.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onRowClick(item)}
                  >
                    <TableCell>
                      {isDocument(item) ? (
                        <FileText className="h-5 w-5 text-blue-500" />
                      ) : (
                        <ExternalLink className="h-5 w-5 text-green-500" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.title}
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-xs truncate">
                      {isDocument(item) ? item.file_name : (item as RagUrl).url}
                    </TableCell>
                    <TableCell className="text-sm">
                      {isDocument(item) ? formatFileSize(item.file_size) : '-'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {item.tags && item.tags.length > 0 ? (
                          item.tags.slice(0, 2).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                        {item.tags && item.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(item.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id, item);
                        }}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
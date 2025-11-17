import { RefreshCw, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { NodeExecution } from "@/types/nodeExecution";
import { formatExecutionTime } from "@/utils/nodeExecutionUtils";
import { StatusBadge } from "../StatusBadge";
import { PaginationControls } from "@/components/PaginationControls";

interface ExecutionTableProps {
  nodeExecutions: NodeExecution[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onRefresh: () => void;
  onDownloadReport: () => void;
  onRowClick: (node: NodeExecution) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
}

export const ExecutionTable = ({
  nodeExecutions,
  isLoading,
  totalCount,
  currentPage,
  itemsPerPage,
  totalPages,
  onRefresh,
  onDownloadReport,
  onRowClick,
  onPageChange,
  onItemsPerPageChange
}: ExecutionTableProps) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daftar Node Executions ({totalCount})</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Menampilkan {totalCount > 0 ? startIndex + 1 : 0}-{endIndex} dari {totalCount} data
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={onDownloadReport}
            variant="default"
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            disabled={totalCount === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50 z-10 border-b">
              <TableRow>
                <TableHead className="w-[100px]">Execution ID</TableHead>
                <TableHead>Node Name</TableHead>
                <TableHead>Exec Index</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Start Run</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={9}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : nodeExecutions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    Tidak ada data log yang cocok dengan filter.
                  </TableCell>
                </TableRow>
              ) : (
                nodeExecutions.map((node) => (
                  <TableRow 
                    key={node.id} 
                    className="cursor-pointer hover:bg-blue-50/50 transition-colors"
                    onClick={() => onRowClick(node)}
                  >
                    <TableCell className="font-mono text-xs max-w-[100px] truncate">
                      {node.execution_id}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {node.node_name}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {(node.execution_index ?? 0) + 1}
                    </TableCell>
                    <TableCell className="text-xs">{node.model_name || "-"}</TableCell>
                    <TableCell><StatusBadge status={node.execution_status} /></TableCell>
                    <TableCell className="text-sm">
                      {formatExecutionTime(node.execution_time_ms)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {node.total_tokens.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-green-700">
                      ${Number(node.estimated_cost_usd).toFixed(6)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {node.start_time 
                        ? new Date(node.start_time).toLocaleDateString('id-ID') 
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls - Sekarang di dalam CardContent */}
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
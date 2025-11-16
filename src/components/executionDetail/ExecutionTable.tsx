import { RefreshCw, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { NodeExecution } from "@/types/nodeExecution";
import { formatExecutionTime } from "@/utils/nodeExecutionUtils";
import { StatusBadge } from "../StatusBadge";

interface ExecutionTableProps {
  nodeExecutions: NodeExecution[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  onRefresh: () => void;
  onDownloadReport: () => void;
  onRowClick: (node: NodeExecution) => void;
}

export const ExecutionTable = ({
  nodeExecutions,
  isLoading,
  totalCount,
  currentPage,
  itemsPerPage,
  onRefresh,
  onDownloadReport,
  onRowClick
}: ExecutionTableProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daftar Node Executions ({totalCount})</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Menampilkan {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} dari {totalCount} data
          </p>
        </div>
        <div>
          <Button 
            className="mr-2" 
            onClick={onRefresh} 
            variant="outline" 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={onDownloadReport}
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            disabled={totalCount === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-x-auto shadow-inner bg-white">
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
      </CardContent>
    </Card>
  );
};
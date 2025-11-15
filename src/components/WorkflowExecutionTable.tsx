// components/WorkflowExecutionTable.tsx

import React from "react";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExecutionStatusBadge } from "./ExecutionStatusBadge";
import { WorkflowExecution } from "../types/workflowExecution";
import { formatDateTime, formatExecutionTime } from "../utils/workflowExecutionUtils";

interface WorkflowExecutionTableProps {
  executions: WorkflowExecution[];
  isLoading: boolean;
  hasFilters: boolean;
  onRowClick: (execution: WorkflowExecution) => void;
}

/**
 * Table component untuk menampilkan list executions
 */
export const WorkflowExecutionTable: React.FC<WorkflowExecutionTableProps> = ({
  executions,
  isLoading,
  hasFilters,
  onRowClick,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>ID Eksekusi</TableHead>
            <TableHead>Nama Workflow</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Waktu Proses</TableHead>
            <TableHead>Biaya (USD)</TableHead>
            <TableHead>Waktu Eksekusi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  // Empty state
  if (executions.length === 0) {
    return (
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>ID Eksekusi</TableHead>
            <TableHead>Nama Workflow</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Waktu Proses</TableHead>
            <TableHead>Biaya (USD)</TableHead>
            <TableHead>Waktu Eksekusi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              {hasFilters
                ? "Tidak ada data yang sesuai dengan filter" 
                : "Belum ada data eksekusi"}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  // Data state
  return (
    <Table>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead>ID Eksekusi</TableHead>
          <TableHead>Nama Workflow</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Waktu Proses</TableHead>
          <TableHead>Biaya (USD)</TableHead>
          <TableHead>Waktu Eksekusi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {executions.map((execution) => (
          <TableRow 
            key={execution.execution_id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onRowClick(execution)}
          >
            <TableCell className="font-mono text-xs">
              {execution.execution_id}
            </TableCell>
            <TableCell className="font-medium">
              {execution.workflow_name || 'N/A'}
            </TableCell>
            <TableCell>
              <ExecutionStatusBadge status={execution.status} />
            </TableCell>
            <TableCell>
              {formatExecutionTime(execution.total_execution_time_ms)}
            </TableCell>
            <TableCell>${execution.estimated_cost_usd.toFixed(4)}</TableCell>
            <TableCell>
              {formatDateTime(execution.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
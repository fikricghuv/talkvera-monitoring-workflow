// components/WorkflowExecutionDetailModal.tsx

import React, { useState, useEffect } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExecutionStatusBadge } from "../executionDetail/ExecutionStatusBadge";
import { WorkflowExecution, NodeExecution } from "../../types/workflowExecution";
import { formatDateTime, formatExecutionTime } from "../../utils/workflowExecutionUtils";
import { EXECUTION_CONSTANTS } from "../../constants/workflowExecution";
import { WorkflowExecutionService } from "../../services/workflowExecutionService";

interface WorkflowExecutionDetailModalProps {
  execution: WorkflowExecution | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal component untuk menampilkan detail lengkap execution dan node executions
 */
export const WorkflowExecutionDetailModal: React.FC<WorkflowExecutionDetailModalProps> = ({
  execution,
  isOpen,
  onClose,
}) => {
  const [nodeExecutions, setNodeExecutions] = useState<NodeExecution[]>([]);
  const [isNodeLoading, setIsNodeLoading] = useState(true);

  // Fetch node executions when modal opens
  useEffect(() => {
    if (!execution?.execution_id) {
      setNodeExecutions([]);
      return;
    }

    const fetchNodes = async () => {
      setIsNodeLoading(true);
      try {
        const nodes = await WorkflowExecutionService.fetchNodeExecutions(execution.execution_id);
        setNodeExecutions(nodes);
      } catch (error) {
        console.error("Error fetching node executions:", error);
      } finally {
        setIsNodeLoading(false);
      }
    };

    fetchNodes();
  }, [execution?.execution_id]);

  if (!execution) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Workflow Execution</DialogTitle>
          <DialogDescription>
            Informasi lengkap dari workflow execution dan ringkasan step node.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Execution Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Workflow Name</p>
                <p className="text-base font-semibold">{execution.workflow_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">
                  <ExecutionStatusBadge status={execution.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Waktu Proses</p>
                <p className="text-base">{formatExecutionTime(execution.total_execution_time_ms)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Biaya (USD)</p>
                <p className="text-base font-mono">${execution.estimated_cost_usd.toFixed(6)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                <p className="text-base">{execution.total_tokens.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Has Errors</p>
                <Badge 
                  variant={execution.has_errors ? "destructive" : "default"} 
                  className={!execution.has_errors ? "bg-green-500 text-white hover:bg-green-600" : ""}
                >
                  {execution.has_errors ? "Yes" : "No"}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">ID Eksekusi</p>
              <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{execution.execution_id}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Waktu Eksekusi</p>
              <p className="text-sm">
                {formatDateTime(execution.created_at, EXECUTION_CONSTANTS.DATE_FORMAT.LONG)}
              </p>
            </div>

            {/* Error Alert */}
            {execution.has_errors && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-1">Eksekusi ini memiliki error</p>
                  <p className="text-sm font-medium">Node: **{execution.error_node_name || 'N/A'}**</p>
                  <p className="text-sm mt-1">Pesan Error: {execution.error_message || 'Tidak ada pesan error.'}</p>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Node Executions Table */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-lg font-semibold">Ringkasan Step Node</h3>
            {isNodeLoading ? (
              <div className="flex items-center justify-center p-6 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p>Memuat step node...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px] text-center">Step</TableHead>
                      <TableHead>Node</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Tokens</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nodeExecutions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Tidak ada data node untuk eksekusi ini.
                        </TableCell>
                      </TableRow>
                    ) : (
                      nodeExecutions.map((node, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-center font-mono">
                            {node.execution_index ?? idx + 1}
                          </TableCell>
                          <TableCell className="font-medium">{node.node_name}</TableCell>
                          <TableCell>
                            <ExecutionStatusBadge 
                              status={node.execution_status ?? (node.has_error ? 'error' : 'success')} 
                            />
                          </TableCell>
                          <TableCell className="text-xs">{node.model_name || '-'}</TableCell>
                          <TableCell>{formatExecutionTime(node.execution_time_ms)}</TableCell>
                          <TableCell className="font-mono">{node.total_tokens.toLocaleString()}</TableCell>
                          <TableCell 
                            className="text-xs text-destructive max-w-[150px] truncate" 
                            title={node.error_message || undefined}
                          >
                            {node.has_error ? (node.error_message || 'Error') : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
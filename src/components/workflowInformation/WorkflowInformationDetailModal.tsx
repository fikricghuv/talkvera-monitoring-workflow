// components/WorkflowInformationDetailModal.tsx

import React from "react";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WorkflowStatusBadge } from "./WorkflowStatusBadge";
import { WorkflowInfo } from "@/types/workflowInformation";
import { formatDateTime, formatTime } from "@/utils/workflowInformationUtils";
import { WORKFLOW_CONSTANTS } from "@/constants/workflowInformation";

interface WorkflowInformationDetailModalProps {
  workflow: WorkflowInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal component untuk menampilkan detail lengkap workflow
 */
export const WorkflowInformationDetailModal: React.FC<WorkflowInformationDetailModalProps> = ({
  workflow,
  isOpen,
  onClose,
}) => {
  if (!workflow) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Workflow Information</DialogTitle>
          <DialogDescription>
            Informasi lengkap dari workflow yang dipilih.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Workflow Name & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Workflow Name</p>
                <p className="text-base font-semibold">{workflow.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">
                  <WorkflowStatusBadge active={workflow.active_status} />
                </div>
              </div>
            </div>

            {/* Total Nodes & Time Saved */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Nodes</p>
                <p className="text-base font-mono">{workflow.total_nodes}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Saved per Execution</p>
                <p className="text-base">{formatTime(workflow.time_saved_per_execution)} per eksekusi</p>
              </div>
            </div>

            {/* Workflow ID */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Workflow ID</p>
              <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{workflow.workflow_id}</p>
            </div>

            {/* Created At & Updated At */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                <p className="text-sm">
                  {formatDateTime(workflow.created_at, WORKFLOW_CONSTANTS.DATE_FORMAT.LONG)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                <p className="text-sm">
                  {workflow.updated_at 
                    ? formatDateTime(workflow.updated_at, WORKFLOW_CONSTANTS.DATE_FORMAT.LONG)
                    : "-"}
                </p>
              </div>
            </div>

            {/* Inserted At (Database) */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inserted At (Database)</p>
              <p className="text-sm">
                {formatDateTime(workflow.inserted_at, WORKFLOW_CONSTANTS.DATE_FORMAT.LONG)}
              </p>
            </div>

            {/* Error Workflow Call (jika ada) */}
            {workflow.error_workflow_call && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-1">Error Workflow Call</p>
                  <p className="text-sm">{workflow.error_workflow_call}</p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
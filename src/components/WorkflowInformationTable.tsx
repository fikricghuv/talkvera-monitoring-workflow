// components/WorkflowInformationTable.tsx

import React from "react";
import { GitBranch, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkflowStatusBadge } from "./WorkflowStatusBadge";
import { WorkflowInfo } from "@/types/workflowInformation";
import { formatDateTime, formatTime } from "@/utils/workflowInformationUtils";

interface WorkflowInformationTableProps {
  workflows: WorkflowInfo[];
  isLoading: boolean;
  hasFilters: boolean;
  onRowClick: (workflow: WorkflowInfo) => void;
}

/**
 * Table component untuk menampilkan list workflows
 */
export const WorkflowInformationTable: React.FC<WorkflowInformationTableProps> = ({
  workflows,
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
            <TableHead>ID</TableHead>
            <TableHead>Workflow Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time Saved</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
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
  if (workflows.length === 0) {
    return (
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Workflow Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time Saved</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              {hasFilters
                ? "Tidak ada data yang sesuai dengan filter" 
                : "Belum ada data workflow"}
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
          <TableHead>ID</TableHead>
          <TableHead>Workflow Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Time Saved</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Updated At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workflows.map((workflow) => (
          <TableRow 
            key={workflow.workflow_id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onRowClick(workflow)}
          >
            <TableCell>{workflow.workflow_id}</TableCell>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                {workflow.name}
              </div>
            </TableCell>
            <TableCell>
              <WorkflowStatusBadge active={workflow.active_status} />
            </TableCell>
            <TableCell>{formatTime(workflow.time_saved_per_execution)}</TableCell>
            <TableCell>{formatDateTime(workflow.created_at)}</TableCell>
            <TableCell>
              {workflow.updated_at ? formatDateTime(workflow.updated_at) : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
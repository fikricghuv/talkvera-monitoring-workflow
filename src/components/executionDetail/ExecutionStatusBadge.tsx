// components/ExecutionStatusBadge.tsx

import React from "react";
import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG } from "../../constants/workflowExecution";

interface ExecutionStatusBadgeProps {
  status: string | null;
}

/**
 * Badge component untuk menampilkan status execution
 */
export const ExecutionStatusBadge: React.FC<ExecutionStatusBadgeProps> = ({ status }) => {
  const statusKey = status?.toLowerCase() || 'cancelled';
  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.cancelled;

  return (
    <Badge variant={config.variant} className={config.className}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'}
    </Badge>
  );
};
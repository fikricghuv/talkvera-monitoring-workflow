// components/WorkflowStatusBadge.tsx

import React from "react";
import { Badge } from "@/components/ui/badge";

interface WorkflowStatusBadgeProps {
  active: boolean;
}

/**
 * Badge component untuk menampilkan status workflow (Active/Inactive)
 */
export const WorkflowStatusBadge: React.FC<WorkflowStatusBadgeProps> = ({ active }) => (
  <Badge 
    variant={active ? "default" : "secondary"} 
    className={active 
      ? "bg-green-500 text-white hover:bg-green-600" 
      : "bg-gray-400 text-white hover:bg-gray-500"
    }
  >
    {active ? "Active" : "Inactive"}
  </Badge>
);
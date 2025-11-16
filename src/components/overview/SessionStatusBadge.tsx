// components/overview/SessionStatusBadge.tsx

import React from "react";
import { Badge } from "@/components/ui/badge";
import { SESSION_STATUS_CONFIG } from "../../constants/chatbotOverview";

interface SessionStatusBadgeProps {
  status: string;
}

/**
 * Badge component untuk menampilkan status session
 */
export const SessionStatusBadge: React.FC<SessionStatusBadgeProps> = ({ status }) => {
  const config = SESSION_STATUS_CONFIG[status] || {
    variant: "outline" as const,
    className: "",
    label: status,
  };

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};
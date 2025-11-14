import { Badge } from "@/components/ui/badge";
import { getQueueStatusConfig } from "@/utils/queueUtils";

interface QueueStatusBadgeProps {
  status: string;
}

export const QueueStatusBadge = ({ status }: QueueStatusBadgeProps) => {
  const config = getQueueStatusConfig(status);
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};
import { Badge } from "@/components/ui/badge";
import { getStatusConfig } from "@/utils/nodeExecutionUtils";

interface StatusBadgeProps {
  status: string | null;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = getStatusConfig(status);
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};
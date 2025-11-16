import { Badge } from "@/components/ui/badge";
import { getAppointmentStatusConfig } from "@/utils/appointmentUtils";

interface AppointmentStatusBadgeProps {
  status: string;
}

export const AppointmentStatusBadge = ({ status }: AppointmentStatusBadgeProps) => {
  const config = getAppointmentStatusConfig(status);

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};
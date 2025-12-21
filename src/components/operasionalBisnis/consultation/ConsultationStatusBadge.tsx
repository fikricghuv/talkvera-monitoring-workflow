// components/consultation/ConsultationStatusBadge.tsx

import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/utils/consultationUtils";

interface ConsultationStatusBadgeProps {
  status: string;
}

export const ConsultationStatusBadge = ({ status }: ConsultationStatusBadgeProps) => {
  const getVariant = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'greetings_sent':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'follow_up_1_sent':
      case 'follow_up_2_sent':
      case 'follow_up_3_sent':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'replied':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'qualified':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'closed_won':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'closed_lost':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getVariant(status)} border font-medium`}
    >
      {getStatusLabel(status)}
    </Badge>
  );
};
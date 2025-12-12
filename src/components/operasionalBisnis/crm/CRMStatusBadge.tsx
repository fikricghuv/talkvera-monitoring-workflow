// components/crm/CRMStatusBadge.tsx

import { Badge } from "@/components/ui/badge";

interface CRMStatusBadgeProps {
  status: string;
  type: 'lifecycle' | 'lead';
}

export const CRMStatusBadge = ({ status, type }: CRMStatusBadgeProps) => {
  const getStatusColor = () => {
    if (type === 'lifecycle') {
      switch (status) {
        case 'lead': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'qualified': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'customer': return 'bg-green-100 text-green-800 border-green-300';
        case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    } else {
      switch (status) {
        case 'new': return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'follow_up': return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'closed_won': return 'bg-green-100 text-green-800 border-green-300';
        case 'closed_lost': return 'bg-red-100 text-red-800 border-red-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    }
  };

  const getStatusLabel = () => {
    if (type === 'lifecycle') {
      switch (status) {
        case 'lead': return 'Lead';
        case 'qualified': return 'Qualified';
        case 'customer': return 'Customer';
        case 'inactive': return 'Inactive';
        default: return status;
      }
    } else {
      switch (status) {
        case 'new': return 'New';
        case 'in_progress': return 'In Progress';
        case 'follow_up': return 'Follow Up';
        case 'closed_won': return 'Won';
        case 'closed_lost': return 'Lost';
        default: return status;
      }
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusColor()} border font-medium`}>
      {getStatusLabel()}
    </Badge>
  );
};
import { Badge } from "@/components/ui/badge";

interface ChatStatusBadgeProps {
  status: string;
}

export const ChatStatusBadge = ({ status }: ChatStatusBadgeProps) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "bg-green-100 text-green-800 border-green-300";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "ENDED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "EXPIRED":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "ERROR":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getStatusStyle(status)} font-semibold text-xs`}
    >
      {status.replace(/_/g, ' ')}
    </Badge>
  );
};
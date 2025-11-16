// src/components/AgentOverviewHeader.tsx

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface AgentOverviewHeaderProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

/**
 * Header section component for agent overview page
 */
export const AgentOverviewHeader: React.FC<AgentOverviewHeaderProps> = ({
  onRefresh,
  isLoading = false,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">Monitor performa dan aktivitas data agent</p>
      </div>
      <Button
        onClick={onRefresh}
        variant="outline"
        size="sm"
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );
};
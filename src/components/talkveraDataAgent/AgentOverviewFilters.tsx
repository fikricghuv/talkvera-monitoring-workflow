// src/components/AgentOverviewFilters.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface AgentOverviewFiltersProps {
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  userFilter: string;
  setUserFilter: (value: string) => void;
  onReset: () => void;
}

/**
 * Filter section component for agent overview
 */
export const AgentOverviewFilters: React.FC<AgentOverviewFiltersProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  userFilter,
  setUserFilter,
  onReset,
}) => {
  return (
    <Card className="shadow-lg">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
            <span className="text-sm text-muted-foreground">s/d</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>

          {/* User Filter */}
          <Input
            type="text"
            placeholder="Filter by User ID..."
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="w-64"
          />

          {/* Reset Button */}
          {(startDate || endDate || userFilter) && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
            >
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
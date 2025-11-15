// components/WorkflowExecutionFilters.tsx

import React from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterState } from "../types/workflowExecution";
import { EXECUTION_CONSTANTS } from "../constants/workflowExecution";

interface WorkflowExecutionFiltersProps {
  filters: FilterState;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onResetDates: () => void;
}

/**
 * Component untuk filter dan search functionality
 */
export const WorkflowExecutionFilters: React.FC<WorkflowExecutionFiltersProps> = ({
  filters,
  onSearchChange,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  onResetDates,
}) => {
  const showSearchWarning = filters.searchTerm.length > 0 && 
    filters.searchTerm.length < EXECUTION_CONSTANTS.MIN_SEARCH_LENGTH;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Filter & Pencarian</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari Workflow Name / Execution ID (min 3 kar)..."
              value={filters.searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
            {showSearchWarning && (
              <p className="text-xs text-amber-600 mt-1">
                Minimal {EXECUTION_CONSTANTS.MIN_SEARCH_LENGTH} karakter untuk pencarian
              </p>
            )}
          </div>

          {/* Status Filter */}
          <Select value={filters.statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              {EXECUTION_CONSTANTS.STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Date Range Filter */}
          <div className="flex items-center gap-4">
            <Input
              type="date"
              placeholder="Tanggal Mulai"
              value={filters.startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="pl-7"
            />
            <Input
              type="date"
              placeholder="Tanggal Akhir"
              value={filters.endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        {/* Active Date Range Badge */}
        {(filters.startDate || filters.endDate) && (
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Periode: {filters.startDate || 'Awal'} - {filters.endDate || 'Sekarang'}
            </Badge>
            <Button
              variant="default"
              size="sm"
              onClick={onResetDates}
              className="h-6 text-xs"
            >
              Reset Periode
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
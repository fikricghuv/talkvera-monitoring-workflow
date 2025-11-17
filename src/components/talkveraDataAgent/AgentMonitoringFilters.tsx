// src/components/AgentMonitoringFilters.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  STATUS_FILTER_OPTIONS,
  METHOD_FILTER_OPTIONS,
  RISK_FILTER_OPTIONS,
  MONITORING_CONSTANTS,
} from "@/constants/agentMonitoring";

interface AgentMonitoringFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  methodFilter: string;
  setMethodFilter: (value: string) => void;
  riskFilter: string;
  setRiskFilter: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  resetFilters: () => void;
}

/**
 * Filter section for query monitoring
 */
export const AgentMonitoringFilters: React.FC<AgentMonitoringFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  methodFilter,
  setMethodFilter,
  riskFilter,
  setRiskFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  resetFilters,
}) => {
  const showMinLengthWarning = searchTerm.length > 0 && searchTerm.length < MONITORING_CONSTANTS.MIN_SEARCH_LENGTH;
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || methodFilter !== 'all' || 
                          riskFilter !== 'all' || startDate || endDate;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Filter & Pencarian</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Row 1: Search, Status, Method */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search question, user, response (min ${MONITORING_CONSTANTS.MIN_SEARCH_LENGTH} chars)...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {showMinLengthWarning && (
              <p className="text-xs text-amber-600 mt-1">
                Minimal {MONITORING_CONSTANTS.MIN_SEARCH_LENGTH} karakter
              </p>
            )}
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Method Filter */}
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter Method" />
            </SelectTrigger>
            <SelectContent>
              {METHOD_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 2: Risk Filter, Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Risk Filter */}
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter Risk" />
            </SelectTrigger>
            <SelectContent>
              {RISK_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range */}
          <div className="flex items-center gap-2 md:col-span-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
          </div>
        </div>

        {/* Active Filters Badge */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            {startDate && endDate && (
              <Badge variant="secondary" className="text-xs">
                📅 {startDate} - {endDate}
              </Badge>
            )}
            {searchTerm && searchTerm.length >= MONITORING_CONSTANTS.MIN_SEARCH_LENGTH && (
              <Badge variant="secondary" className="text-xs">
                🔍 "{searchTerm}"
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Status: {STATUS_FILTER_OPTIONS.find(o => o.value === statusFilter)?.label}
              </Badge>
            )}
            {methodFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Method: {METHOD_FILTER_OPTIONS.find(o => o.value === methodFilter)?.label}
              </Badge>
            )}
            {riskFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Risk: {RISK_FILTER_OPTIONS.find(o => o.value === riskFilter)?.label}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-6"
            >
              Reset All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
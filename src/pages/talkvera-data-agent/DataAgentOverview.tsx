// src/pages/AgentOverview.tsx

import { useState } from 'react';
import { RefreshCw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AgentOverviewFilters } from '@/types/dataAgentOverview';
import { useAgentOverview } from '@/hooks/useDataAgentOverview';

// Components
import { AgentOverviewSkeleton } from '@/components/talkveraDataAgent/AgentOverviewSkeleton';
import { AgentOverviewHeader } from '@/components/talkveraDataAgent/AgentOverviewHeader';
import { AgentKPICards } from '@/components/talkveraDataAgent/AgentKPICards';
import { AgentTimeSeriesChart } from '@/components/talkveraDataAgent/AgentTimeSeriesChart';
import { AgentResponseTimeChart } from '@/components/talkveraDataAgent/AgentResponseTimeChart';
import { AgentMethodChart } from '@/components/talkveraDataAgent/AgentMethodChart';
import { AgentRiskTable } from '@/components/talkveraDataAgent/AgentRiskTable';
import { AgentTopUsersTable } from '@/components/talkveraDataAgent/AgentTopUsersTable';

// Period filter type
type PeriodFilter = "7days" | "30days" | "3months" | "custom";

/**
 * Main agent overview page component
 */
const AgentOverview = () => {
  // ========== STATE MANAGEMENT ==========
  
  // Period Filter States
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("7days");
  const [customDates, setCustomDates] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  // ========== CALCULATE DATE RANGE ==========
  
  const getCurrentDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    switch (periodFilter) {
      case "7days":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "3months":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "custom":
        startDate = new Date(customDates.start);
        endDate.setTime(new Date(customDates.end).getTime());
        break;
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const dateRange = getCurrentDateRange();

  // ========== BUILD FILTERS ==========
  
  const filters: AgentOverviewFilters = {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    userFilter: "", // Removed user filter for simplicity
  };

  // ========== FETCH DATA ==========
  
  const {
    kpiData,
    timeSeriesData,
    methodDistribution,
    riskDistribution,
    topUsers,
    isLoading,
    refreshData,
  } = useAgentOverview(filters);

  // ========== RENDER ==========
  
  // Show loading skeleton on initial load
  if (isLoading && timeSeriesData.length === 0) {
    return <AgentOverviewSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Period Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <AgentOverviewHeader />

          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            {/* Period Filter Dropdown */}
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white text-sm"
            >
              <option value="7days">7 Hari Terakhir</option>
              <option value="30days">30 Hari Terakhir</option>
              <option value="3months">3 Bulan Terakhir</option>
              <option value="custom">Periode Custom</option>
            </select>

            {/* Refresh Button */}
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="shadow-sm bg-white"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            {/* Custom Date Inputs */}
            {periodFilter === "custom" && (
              <div className="flex items-center gap-2 border-l pl-2 w-full sm:w-auto">
                <Calendar className="h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  value={customDates.start}
                  onChange={(e) =>
                    setCustomDates((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <span className="text-gray-500 text-sm">s/d</span>
                <input
                  type="date"
                  value={customDates.end}
                  onChange={(e) =>
                    setCustomDates((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <AgentKPICards kpiData={kpiData} />

        {/* Charts Row 1: Time Series & Response Time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgentTimeSeriesChart data={timeSeriesData} />
          <AgentResponseTimeChart data={timeSeriesData} />
        </div>

        {/* Charts Row 2: Method Distribution & Risk Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgentMethodChart data={methodDistribution} />
          <AgentRiskTable data={riskDistribution} />
        </div>

        {/* Top Users Table */}
        <AgentTopUsersTable data={topUsers} />
      </div>
    </div>
  );
};

export default AgentOverview;
// src/pages/AgentOverview.tsx

import { useState } from 'react';
import type { AgentOverviewFilters } from '@/types/dataAgent';
import { getDefaultDateRange } from '@/utils/dataAgentUtils';
import { useAgentOverview } from '@/hooks/useDataAgentOverview';

// Components
import { AgentOverviewSkeleton } from '@/components/talkveraDataAgent/AgentOverviewSkeleton';
import { AgentOverviewHeader } from '@/components/talkveraDataAgent/AgentOverviewHeader';
import { AgentOverviewFilters as AgentFiltersComponent } from '@/components/talkveraDataAgent/AgentOverviewFilters';
import { AgentKPICards } from '@/components/talkveraDataAgent/AgentKPICards';
import { AgentTimeSeriesChart } from '@/components/talkveraDataAgent/AgentTimeSeriesChart';
import { AgentResponseTimeChart } from '@/components/talkveraDataAgent/AgentResponseTimeChart';
import { AgentMethodChart } from '@/components/talkveraDataAgent/AgentMethodChart';
import { AgentRiskTable } from '@/components/talkveraDataAgent/AgentRiskTable';
import { AgentTopUsersTable } from '@/components/talkveraDataAgent/AgentTopUsersTable';

/**
 * Main agent overview page component
 */
const AgentOverview = () => {
  // Get default date range (last 7 days)
  const defaultDateRange = getDefaultDateRange(7);

  // Filter state
  const [startDate, setStartDate] = useState(defaultDateRange.start);
  const [endDate, setEndDate] = useState(defaultDateRange.end);
  const [userFilter, setUserFilter] = useState("");

  // Build filters object
  const filters: AgentOverviewFilters = {
    startDate,
    endDate,
    userFilter,
  };

  // Fetch data using custom hook
  const {
    kpiData,
    timeSeriesData,
    methodDistribution,
    riskDistribution,
    topUsers,
    isLoading,
    refreshData,
  } = useAgentOverview(filters);

  // Reset filters
  const handleResetFilters = () => {
    const defaultRange = getDefaultDateRange(7);
    setStartDate(defaultRange.start);
    setEndDate(defaultRange.end);
    setUserFilter("");
  };

  // Show loading skeleton on initial load
  if (isLoading && timeSeriesData.length === 0) {
    return <AgentOverviewSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <AgentOverviewHeader
          onRefresh={refreshData}
          isLoading={isLoading}
        />

        {/* Filters */}
        <AgentFiltersComponent
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          userFilter={userFilter}
          setUserFilter={setUserFilter}
          onReset={handleResetFilters}
        />

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
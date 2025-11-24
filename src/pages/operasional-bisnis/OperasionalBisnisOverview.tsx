// src/pages/OperasionalBisnisToolUsageOverview.tsx

import { useState } from 'react';
import { RefreshCw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OperasionalBisnisOverviewFilters } from '@/types/operasionalBisnisToolUsage';
import { useOperasionalBisnisOverview } from '@/hooks/useOperasionalBisnisOverview';

// Components
import { OperasionalBisnisOverviewSkeleton } from '@/components/operasionalBisnis/OperasionalBisnisOverviewSkeleton';
import { OperasionalBisnisOverviewHeader } from '@/components/operasionalBisnis/OperasionalBisnisOverviewHeader';
import { OperasionalBisnisKPICards } from '@/components/operasionalBisnis/OperasionalBisnisKPICards';
import { OperasionalBisnisTimeSeriesChart } from '@/components/operasionalBisnis/OperasionalBisnisTimeSeriesChart';
import { OperasionalBisnisCategoryChart } from '@/components/operasionalBisnis/OperasionalBisnisCategoryChart';
import { OperasionalBisnisOperationChart } from '@/components/operasionalBisnis/OperasionalBisnisOperationChart';
import { OperasionalBisnisTopToolsTable } from '@/components/operasionalBisnis/OperasionalBisnisTopToolsTable';
import { OperasionalBisnisTopUsersTable } from '@/components/operasionalBisnis/OperasionalBisnisTopUsersTable';

// Period filter type
type PeriodFilter = "7days" | "30days" | "3months" | "custom";

/**
 * Main OperasionalBisnis Tool Usage overview page component
 */
const OperasionalBisnisOverview = () => {
  // ========== STATE MANAGEMENT ==========
  
  // Period Filter States
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("7days");
  const [customDates, setCustomDates] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  // Category Filter
  const [categoryFilter, setCategoryFilter] = useState<string>("");

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
  
  const filters: OperasionalBisnisOverviewFilters = {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    userFilter: "",
    categoryFilter: categoryFilter,
  };

  // ========== FETCH DATA ==========
  
  const {
    kpiData,
    timeSeriesData,
    categoryDistribution,
    operationDistribution,
    topTools,
    topUsers,
    isLoading,
    refreshData,
  } = useOperasionalBisnisOverview(filters);

  // ========== RENDER ==========
  
  // Show loading skeleton on initial load
  if (isLoading && timeSeriesData.length === 0) {
    return <OperasionalBisnisOverviewSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <OperasionalBisnisOverviewHeader />

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

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white text-sm"
            >
              <option value="">Semua Kategori</option>
              <option value="transactions">Transactions</option>
              <option value="content">Content</option>
              <option value="crm">CRM</option>
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
        <OperasionalBisnisKPICards kpiData={kpiData} />

        {/* Charts Row 1: Time Series & Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OperasionalBisnisTimeSeriesChart data={timeSeriesData} />
          <OperasionalBisnisCategoryChart data={categoryDistribution} />
        </div>

        {/* Charts Row 2: Operation Distribution */}
        <div className="grid grid-cols-1 gap-6">
          <OperasionalBisnisOperationChart data={operationDistribution} />
        </div>

        {/* Top Tools Table */}
        <OperasionalBisnisTopToolsTable data={topTools} />

        {/* Top Users Table */}
        <OperasionalBisnisTopUsersTable data={topUsers} />
      </div>
    </div>
  );
};

export default OperasionalBisnisOverview;
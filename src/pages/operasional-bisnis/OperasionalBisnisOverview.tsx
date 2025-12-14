// src/pages/OperasionalBisnisToolUsageOverview.tsx

import { useState } from 'react';
import { RefreshCw, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OperasionalBisnisOverviewFilters } from '@/types/operasionalBisnisToolUsage';
import { useOperasionalBisnisOverview } from '@/hooks/useOperasionalBisnisOverview';
import { SOURCE_FILTERS, LIFECYCLE_STAGES, LEAD_STATUSES } from '@/constants/operasionalBisnisToolUsage';

// Components
import { OperasionalBisnisOverviewSkeleton } from '@/components/operasionalBisnis/overview/OperasionalBisnisOverviewSkeleton';
import { OperasionalBisnisOverviewHeader } from '@/components/operasionalBisnis/overview/OperasionalBisnisOverviewHeader';
import { OperasionalBisnisKPICards } from '@/components/operasionalBisnis/overview/OperasionalBisnisKPICards';
import { OperasionalBisnisTimeSeriesChart } from '@/components/operasionalBisnis/overview/OperasionalBisnisTimeSeriesChart';
import { OperasionalBisnisSourceChart } from '@/components/operasionalBisnis/overview/OperasionalBisnisSourceChart';
import { OperasionalBisnisLifecycleChart } from '@/components/operasionalBisnis/overview/OperasionalBisnisLifecycleChart';
import { OperasionalBisnisLeadStatusChart } from '@/components/operasionalBisnis/overview/OperasionalBisnisLeadStatusChart';
import { OperasionalBisnisSessionStatusChart } from '@/components/operasionalBisnis/overview/OperasionalBisnisSessionStatusChart';
import { OperasionalBisnisAppointmentStatusChart } from '@/components/operasionalBisnis/overview/OperasionalBisnisAppointmentStatusChart';
import { OperasionalBisnisConversionFunnelChart } from '@/components/operasionalBisnis/overview/OperasionalBisnisConversionFunnelChart';
import { OperasionalBisnisTopContactsTable } from '@/components/operasionalBisnis/overview/OperasionalBisnisTopContactsTable';
import { OperasionalBisnisRecentSessionsTable } from '@/components/operasionalBisnis/overview/OperasionalBisnisRecentSessionsTable';
import { OperasionalBisnisUpcomingAppointmentsTable } from '@/components/operasionalBisnis/overview/OperasionalBisnisUpcomingAppointmentsTable';

type PeriodFilter = "7days" | "30days" | "3months" | "custom";

/**
 * Main OperasionalBisnis overview page component
 */
const OperasionalBisnisOverview = () => {
  // ========== STATE MANAGEMENT ==========
  
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("7days");
  const [customDates, setCustomDates] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [lifecycleFilter, setLifecycleFilter] = useState<string>("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("");

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
    sourceFilter: sourceFilter as any,
    lifecycleFilter,
    leadStatusFilter,
  };

  // ========== FETCH DATA ==========
  
  const {
    kpiData,
    timeSeriesData,
    sourceDistribution,
    lifecycleDistribution,
    leadStatusDistribution,
    sessionStatusDistribution,
    appointmentStatusDistribution,
    conversionFunnels,
    topContacts,
    recentSessions,
    upcomingAppointments,
    isLoading,
    refreshData,
  } = useOperasionalBisnisOverview(filters);

  // ========== RENDER ==========
  
  if (isLoading && timeSeriesData.length === 0) {
    return <OperasionalBisnisOverviewSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen pb-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 pt-6">
          <OperasionalBisnisOverviewHeader />

          {/* Filter Row */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filters:</span>
              </div>

              {/* Period Filter */}
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="7days">7 Hari Terakhir</option>
                <option value="30days">30 Hari Terakhir</option>
                <option value="3months">3 Bulan Terakhir</option>
                <option value="custom">Periode Custom</option>
              </select>

              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                {SOURCE_FILTERS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Lifecycle Filter */}
              <select
                value={lifecycleFilter}
                onChange={(e) => setLifecycleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                {LIFECYCLE_STAGES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Lead Status Filter */}
              <select
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                {LEAD_STATUSES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Custom Date Inputs */}
              {periodFilter === "custom" && (
                <div className="flex items-center gap-2 border-l pl-3 ml-2">
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

              {/* Refresh Button */}
              <div className="ml-auto">
                <Button
                  onClick={refreshData}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="shadow-sm"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <OperasionalBisnisKPICards kpiData={kpiData} />

        {/* Time Series Chart - Full Width */}
        <OperasionalBisnisTimeSeriesChart data={timeSeriesData} />

        {/* Row 1: Source & Lifecycle Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OperasionalBisnisSourceChart data={sourceDistribution} />
          <OperasionalBisnisLifecycleChart data={lifecycleDistribution} />
        </div>

        {/* Row 2: Lead Status & Session Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OperasionalBisnisLeadStatusChart data={leadStatusDistribution} />
          <OperasionalBisnisSessionStatusChart data={sessionStatusDistribution} />
        </div>

        {/* Row 3: Appointment Status & Conversion Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OperasionalBisnisAppointmentStatusChart data={appointmentStatusDistribution} />
          <OperasionalBisnisConversionFunnelChart data={conversionFunnels} />
        </div>

        {/* Top Contacts Table */}
        <OperasionalBisnisTopContactsTable data={topContacts} />

        {/* Recent Sessions Table */}
        <OperasionalBisnisRecentSessionsTable data={recentSessions} />

        {/* Upcoming Appointments Table */}
        <OperasionalBisnisUpcomingAppointmentsTable data={upcomingAppointments} />
      </div>
    </div>
  );
};

export default OperasionalBisnisOverview;
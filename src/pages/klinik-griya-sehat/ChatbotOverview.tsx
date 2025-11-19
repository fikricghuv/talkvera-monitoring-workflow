// pages/ChatbotOverview.tsx

import React, { useState } from "react";
import { RefreshCw, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useChatbotOverviewData } from "../../hooks/useChatbotOverviewData";
import { ChatbotOverviewSkeleton } from "../../components/klinikGriyaSehat/overview/ChatbotOverviewSkeleton";
import { ChatbotOverviewHeader } from "../../components/klinikGriyaSehat/overview/ChatbotOverviewHeader";
import { ChatbotOverviewMetrics } from "../../components/klinikGriyaSehat/overview/ChatbotOverviewMetrics";
import { RecentActivityTable } from "../../components/klinikGriyaSehat/overview/RecentActivityTable";
import { SessionStatusChart } from "../../components/klinikGriyaSehat/overview/SessionStatusChart";

// Date filter options
type PeriodFilter = "7days" | "30days" | "3months" | "custom";

/**
 * Main page component untuk Chatbot Overview (Dashboard)
 */
const ChatbotOverview: React.FC = () => {
  // ========== STATE MANAGEMENT ==========
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("30days");
  const [customDates, setCustomDates] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  // Get current date range based on filter
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

    return { startDate, endDate };
  };

  const dateRange = getCurrentDateRange();

  // ========== FETCH DATA ==========
  const { data, isLoading, refetch } = useChatbotOverviewData(
    dateRange.startDate,
    dateRange.endDate
  );

  // ========== EVENT HANDLERS ==========
  const handleRefresh = () => {
    refetch();
  };

  // ========== RENDER ==========

  // Show skeleton on initial load
  if (isLoading && data.recentSessions.length === 0) {
    return <ChatbotOverviewSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <ChatbotOverviewHeader />

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
              onClick={handleRefresh}
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

        {/* KPI Metrics */}
        <ChatbotOverviewMetrics kpiData={data.kpiData} />

        {/* Charts & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Status Distribution Chart */}
          <Card className="lg:col-span-1 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">
                Distribusi Status Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SessionStatusChart
                data={data.statusDistribution}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Recent Activity Table */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
              <p className="text-sm text-muted-foreground">
                10 sesi chat terakhir
              </p>
            </CardHeader>
            <CardContent>
              <RecentActivityTable
                sessions={data.recentSessions}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatbotOverview;
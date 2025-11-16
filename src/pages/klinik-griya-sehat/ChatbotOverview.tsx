// pages/ChatbotOverview.tsx

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { useChatbotOverviewData } from "../../hooks/useChatbotOverviewData";

import { ChatbotOverviewSkeleton } from "../../components/overview/ChatbotOverviewSkeleton";
import { ChatbotOverviewHeader } from "../../components/overview/ChatbotOverviewHeader";
import { ChatbotOverviewMetrics } from "../../components/overview/ChatbotOverviewMetrics";
import { RecentActivityTable } from "../../components/overview/RecentActivityTable";
import { SessionStatusChart } from "../../components/overview/SessionStatusChart";

/**
 * Main page component untuk Chatbot Overview (Dashboard)
 */
const ChatbotOverview: React.FC = () => {
  // ========== STATE MANAGEMENT ==========
  const [autoRefresh, setAutoRefresh] = useState(false);

  // ========== FETCH DATA ==========
  const { data, isLoading, refetch } = useChatbotOverviewData(autoRefresh);

  // ========== EVENT HANDLERS ==========
  const handleRefresh = () => {
    refetch();
  };

  const handleAutoRefreshToggle = (checked: boolean) => {
    setAutoRefresh(checked);
  };

  // ========== RENDER ==========

  // Show skeleton on initial load
  if (isLoading && data.recentSessions.length === 0) {
    return <ChatbotOverviewSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <ChatbotOverviewHeader />
          
          <div className="flex items-center gap-4">
            {/* Auto Refresh Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={handleAutoRefreshToggle}
              />
              <Label htmlFor="auto-refresh" className="text-sm cursor-pointer">
                Auto Refresh
              </Label>
              {autoRefresh && (
                <Badge variant="secondary" className="text-xs">
                  30s
                </Badge>
              )}
            </div>

            {/* Manual Refresh Button */}
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Metrics */}
        <ChatbotOverviewMetrics kpiData={data.kpiData} />

        {/* Charts & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Status Distribution Chart */}
          <Card className="lg:col-span-1 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Distribusi Status Session</CardTitle>
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

        {/* Quick Stats Info */}
        <Card className="shadow-lg border-l-4 border-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span>Completed: {data.kpiData.completedSessions}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <span>In Progress: {data.kpiData.activeSessions}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                <span>Total Messages: {data.kpiData.totalMessages.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotOverview;
import { useState } from "react";
import { toast } from "sonner";
import { useDashboardData } from "@/hooks/useDashboardData";
import { getInitialCustomDates } from "@/utils/dateUtils";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricsSection } from "@/components/MetricsSection";
import { ChartsSection } from "@/components/ChartsSection";

const OverviewKlinikGriyaSehat = () => {
  const [periodFilter, setPeriodFilter] = useState("30days");
  const [customDates, setCustomDates] = useState(getInitialCustomDates);

  const { metrics, isLoading, refetch } = useDashboardData(periodFilter, customDates);

  const handleRefresh = () => {
    toast.info("Memuat ulang data...");
    refetch();
  };

  if (isLoading || !metrics) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader 
          periodFilter={periodFilter}
          setPeriodFilter={setPeriodFilter}
          customDates={customDates}
          setCustomDates={setCustomDates}
          onRefresh={handleRefresh}
        />

        <MetricsSection metrics={metrics.workflows} />

        <ChartsSection 
          dailyExecutions={metrics.trends.dailyExecutions}
          topWorkflows={metrics.trends.topWorkflows}
          costByDay={metrics.trends.costByDay}
          tokenUsage={metrics.trends.tokenUsage}
        />
      </div>
    </div>
  );
};

export default OverviewKlinikGriyaSehat;
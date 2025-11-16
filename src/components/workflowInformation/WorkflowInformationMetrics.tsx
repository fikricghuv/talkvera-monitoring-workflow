// components/WorkflowInformationMetrics.tsx

import React from "react";
import { Workflow, CheckCircle2, Clock } from "lucide-react";
import { AnimatedMetricCard } from "@/components/AnimatedMetricCard"; // ⚠️ Import dari shared component
import { KPIData } from "../../types/workflowInformation";

interface WorkflowInformationMetricsProps {
  kpiData: KPIData;
}

/**
 * Component untuk menampilkan KPI metrics cards
 */
export const WorkflowInformationMetrics: React.FC<WorkflowInformationMetricsProps> = ({ kpiData }) => {
  const activePercentage = kpiData.totalWorkflows > 0
    ? ((kpiData.activeWorkflows / kpiData.totalWorkflows) * 100).toFixed(1)
    : "0";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <AnimatedMetricCard
        title="Total Workflow"
        value={kpiData.totalWorkflows}
        suffix=""
        icon={<Workflow className="h-5 w-5 text-blue-500" />}
        borderColor="border-blue-500"
        subtitle="Total workflow terdaftar"
        decimals={0}
      />
      
      <AnimatedMetricCard
        title="Workflow Aktif"
        value={kpiData.activeWorkflows}
        suffix=""
        icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
        borderColor="border-green-600"
        subtitle={kpiData.totalWorkflows > 0 
          ? `${activePercentage}% dari total` 
          : "Tidak ada data"}
        decimals={0}
      />

      <AnimatedMetricCard
        title="Estimasi Penghematan Waktu"
        value={kpiData.totalTimeSaved}
        suffix=" menit"
        icon={<Clock className="h-5 w-5 text-orange-500" />}
        borderColor="border-orange-500"
        subtitle="Total per-eksekusi"
        decimals={0}
        useLocaleString={true}
      />
    </div>
  );
};
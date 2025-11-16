// components/WorkflowExecutionMetrics.tsx

import React from "react";
import { CirclePlay, AlertTriangle, DollarSign, Cpu } from "lucide-react";
import { AnimatedMetricCard } from "@/components/AnimatedMetricCard";
import { KPIData } from "../../types/workflowExecution";

interface WorkflowExecutionMetricsProps {
  kpiData: KPIData;
}

/**
 * Component untuk menampilkan KPI metrics cards
 */
export const WorkflowExecutionMetrics: React.FC<WorkflowExecutionMetricsProps> = ({ kpiData }) => {
  const failurePercentage = kpiData.totalExecutions > 0
    ? ((kpiData.failedExecutions / kpiData.totalExecutions) * 100).toFixed(1)
    : "0";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AnimatedMetricCard
        title="Total Eksekusi"
        value={kpiData.totalExecutions}
        suffix=""
        icon={<CirclePlay className="h-5 w-5 text-blue-500" />}
        borderColor="border-blue-500"
        subtitle="Total"
        decimals={0}
      />
      
      <AnimatedMetricCard
        title="Eksekusi Gagal"
        value={kpiData.failedExecutions}
        suffix=""
        icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
        borderColor="border-red-500"
        subtitle={kpiData.totalExecutions > 0
          ? `${failurePercentage}% dari total`
          : "Tidak ada data"}
        decimals={0}
      />

      <AnimatedMetricCard
        title="Total Estimasi Biaya (USD)"
        value={kpiData.totalCost}
        prefix="$ "
        icon={<DollarSign className="h-5 w-5 text-green-600" />}
        borderColor="border-green-600"
        subtitle="Estimasi biaya AI"
        decimals={4}
      />

      <AnimatedMetricCard
        title="Total Token"
        value={kpiData.totalTokens}
        suffix=""
        icon={<Cpu className="h-5 w-5 text-blue-800" />}
        borderColor="border-blue-800"
        subtitle="Total token digunakan"
        decimals={0}
      />
    </div>
  );
};
// ===== 1. ExecutionMetrics.tsx (Updated Component) =====
import { Network, CircleCheckBig, Timer, Cpu } from "lucide-react";
import { AnimatedMetricCard } from "../AnimatedMetricCard";
import { MetricsData } from "@/types/nodeExecution";
import { formatExecutionTime } from "@/utils/nodeExecutionUtils";

interface ExecutionMetricsProps {
  metrics: MetricsData;
  isFiltered?: boolean; // Indikator apakah sedang ada filter aktif
}

export const ExecutionMetrics = ({ metrics, isFiltered = false }: ExecutionMetricsProps) => {
  return (
    <div className="space-y-2">
      {isFiltered && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          ℹ️ Metrics ini dihitung berdasarkan data yang terfilter (bukan keseluruhan data)
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedMetricCard
          title="Total Nodes"
          value={metrics.totalNodes}
          suffix=""
          icon={<Network className="h-5 w-5 text-blue-500" />}
          borderColor="border-blue-500"
          subtitle="Tereksekusi"
          decimals={0}
        />

        <AnimatedMetricCard
          title="Success Rate"
          value={metrics.totalNodes > 0 
            ? ((metrics.successNodes / metrics.totalNodes) * 100) 
            : 0}
          suffix="%"
          icon={<CircleCheckBig className="h-5 w-5 text-green-500" />}
          borderColor="border-green-500"
          subtitle={`${metrics.successNodes} sukses, ${metrics.errorNodes} error`}
          decimals={1}
        />

        <AnimatedMetricCard
          title="Avg Execution"
          value={parseFloat(formatExecutionTime(metrics.avgExecutionTime).replace(/[^\d.]/g, ''))}
          suffix="s"
          icon={<Timer className="h-5 w-5 text-yellow-500" />}
          borderColor="border-yellow-500"
          subtitle="In Second"
          decimals={2}
        />

        <AnimatedMetricCard
          title="Total Tokens"
          value={metrics.totalTokens}
          suffix=""
          icon={<Cpu className="h-5 w-5 text-orange-500" />}
          borderColor="border-orange-500"
          subtitle={`Prompt: ${metrics.totalPromptTokens.toLocaleString()} | Completion: ${metrics.totalCompletionTokens.toLocaleString()}`}
          decimals={0}
        />
      </div>
    </div>
  );
};
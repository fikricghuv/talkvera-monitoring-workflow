import { 
  Clock, 
  CheckCircle, 
  DollarSign,
  PlayCircle,
  Timer
} from "lucide-react";
import { AnimatedMetricCard } from "./AnimatedMetricCard";

interface MetricsSectionProps {
  metrics: {
    total: number;
    successful: number;
    failed: number;
    avgExecutionTime: number;
    totalCost: number;
    totalTokens: number;
    totalTimeSaved: number;
    totalTimeExecution: number;
  };
}

export const MetricsSection = ({ metrics }: MetricsSectionProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-gray-900">Metrik Workflow Execution</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatedMetricCard
          title="Total Eksekusi"
          value={metrics.total}
          icon={<PlayCircle className="h-5 w-5 text-blue-500" />}
          borderColor="border-blue-500"
          subtitle={
            <>
              <span className="text-green-600">{metrics.successful} berhasil</span> · 
              <span className="text-red-600 ml-1">{metrics.failed} gagal</span>
            </>
          }
        />
        <AnimatedMetricCard
          title="Success Rate"
          value={((metrics.successful / metrics.total) * 100)}
          suffix="%"
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          borderColor="border-green-600"
          subtitle="Tingkat keberhasilan"
          decimals={1}
        />
        <AnimatedMetricCard
          title="Avg Execution Time"
          value={(metrics.avgExecutionTime / 1000)}
          suffix=" sec"
          icon={<Timer className="h-5 w-5 text-blue-900" />}
          borderColor="border-blue-900"
          subtitle="Rata-rata waktu eksekusi"
          decimals={2}
        />
        <AnimatedMetricCard
          title="Total Cost"
          value={metrics.totalCost}
          prefix="$ "
          icon={<DollarSign className="h-5 w-5 text-green-800" />}
          borderColor="border-green-800"
          subtitle={`${metrics.totalTokens.toLocaleString()} tokens`}
          decimals={4}
        />
        <AnimatedMetricCard
          title="Total Time Saved"
          value={metrics.totalTimeSaved}
          suffix=" min"
          icon={<Clock className="h-5 w-5 text-purple-600" />}
          borderColor="border-purple-600"
          subtitle="Waktu yang dihemat"
          decimals={2}
        />
        <AnimatedMetricCard
          title="Total Waktu Eksekusi"
          value={(metrics.totalTimeExecution / 1000 / 60)}
          suffix=" min"
          icon={<Timer className="h-5 w-5 text-orange-600" />}
          borderColor="border-orange-600"
          subtitle="Total waktu eksekusi"
          decimals={2}
        />
      </div>
    </div>
  );
};
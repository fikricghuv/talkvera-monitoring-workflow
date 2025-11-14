import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { AnimatedMetricCard } from "./AnimatedMetricCard";
import { QueueKPI } from "@/types/processQueue";

interface QueueMetricsProps {
  kpiData: QueueKPI;
}

export const QueueMetrics = ({ kpiData }: QueueMetricsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <AnimatedMetricCard
        title="Antrian Pending"
        value={kpiData.newQueue}
        suffix=""
        icon={<Clock className="h-5 w-5 text-yellow-500" />}
        borderColor="border-yellow-500"
        subtitle="Menunggu diproses"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Selesai Diproses"
        value={kpiData.processed}
        suffix=""
        icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        borderColor="border-green-600"
        subtitle="Status Done"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Gagal Diproses"
        value={kpiData.failed}
        suffix=""
        icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
        borderColor="border-red-500"
        subtitle="Perlu perhatian"
        decimals={0}
      />
    </div>
  );
};
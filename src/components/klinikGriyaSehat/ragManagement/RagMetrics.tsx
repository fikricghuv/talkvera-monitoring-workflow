// components/ragManagement/RagMetrics.tsx
import { FileText, ExternalLink, Clock, CheckCircle2, XCircle, HardDrive } from "lucide-react";
import { AnimatedMetricCard } from "@/components/AnimatedMetricCard";
import { RagMetrics as MetricsType } from "@/types/ragManagement";

interface RagMetricsProps {
  metrics: MetricsType;
}

export const RagMetrics = ({ metrics }: RagMetricsProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <AnimatedMetricCard
        title="Total Dokumen"
        value={metrics.totalDocuments}
        suffix=""
        icon={<FileText className="h-5 w-5 text-blue-500" />}
        borderColor="border-blue-500"
        subtitle="File terupload"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Total URL"
        value={metrics.totalUrls}
        suffix=""
        icon={<ExternalLink className="h-5 w-5 text-green-500" />}
        borderColor="border-green-500"
        subtitle="URL terdaftar"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Pending"
        value={metrics.pendingItems}
        suffix=""
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        borderColor="border-amber-500"
        subtitle="Menunggu proses"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Completed"
        value={metrics.completedItems}
        suffix=""
        icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
        borderColor="border-emerald-500"
        subtitle="Berhasil diproses"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Failed"
        value={metrics.failedItems}
        suffix=""
        icon={<XCircle className="h-5 w-5 text-red-500" />}
        borderColor="border-red-500"
        subtitle="Gagal diproses"
        decimals={0}
      />

      <div className="bg-white rounded-lg shadow-lg border-l-4 border-purple-500 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">Total Storage</h3>
          <HardDrive className="h-5 w-5 text-purple-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {formatFileSize(metrics.totalSize)}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Ukuran total file
        </p>
      </div>
    </div>
  );
};
// components/consultation/ConsultationMetrics.tsx

import { 
  FileText, 
  Mail, 
  MessageSquare, 
  Reply, 
  CheckCircle, 
  Trophy, 
  XCircle, 
  Calendar 
} from "lucide-react";
import { AnimatedMetricCard } from "@/components/AnimatedMetricCard";
import { ConsultationMetrics as MetricsType } from "@/types/consultationRequests";

interface ConsultationMetricsProps {
  metrics: MetricsType;
}

export const ConsultationMetrics = ({ metrics }: ConsultationMetricsProps) => {
  return (
    <>
      {/* First Row - Main Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedMetricCard
          title="Total Request"
          value={metrics.totalRequests}
          suffix=""
          icon={<FileText className="h-5 w-5 text-blue-500" />}
          borderColor="border-blue-500"
          subtitle="Semua request"
          decimals={0}
        />

        <AnimatedMetricCard
          title="New Request"
          value={metrics.newRequests}
          suffix=""
          icon={<Mail className="h-5 w-5 text-yellow-500" />}
          borderColor="border-yellow-500"
          subtitle="Belum diproses"
          decimals={0}
        />

        <AnimatedMetricCard
          title="Greetings Sent"
          value={metrics.greetingsSent}
          suffix=""
          icon={<MessageSquare className="h-5 w-5 text-indigo-500" />}
          borderColor="border-indigo-500"
          subtitle="Email awal terkirim"
          decimals={0}
        />

        <AnimatedMetricCard
          title="In Follow Up"
          value={metrics.inFollowUp}
          suffix=""
          icon={<Reply className="h-5 w-5 text-purple-500" />}
          borderColor="border-purple-500"
          subtitle="Dalam tahap follow up"
          decimals={0}
        />
      </div>

      {/* Second Row - Status Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedMetricCard
          title="Replied"
          value={metrics.replied}
          suffix=""
          icon={<Reply className="h-5 w-5 text-cyan-500" />}
          borderColor="border-cyan-500"
          subtitle="Mendapat balasan"
          decimals={0}
        />

        <AnimatedMetricCard
          title="Qualified"
          value={metrics.qualified}
          suffix=""
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          borderColor="border-green-500"
          subtitle="Lead qualified"
          decimals={0}
        />

        <AnimatedMetricCard
          title="Closed Won"
          value={metrics.closedWon}
          suffix=""
          icon={<Trophy className="h-5 w-5 text-emerald-500" />}
          borderColor="border-emerald-500"
          subtitle="Berhasil closing"
          decimals={0}
        />

        <AnimatedMetricCard
          title="Closed Lost"
          value={metrics.closedLost}
          suffix=""
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          borderColor="border-red-500"
          subtitle="Tidak berhasil"
          decimals={0}
        />
      </div>
    </>
  );
};
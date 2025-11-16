// components/overview/ChatbotOverviewMetrics.tsx

import React from "react";
import { Users, MessageSquare, CheckCircle2, Calendar, Clock, AlertCircle } from "lucide-react";
import { AnimatedMetricCard } from "@/components/AnimatedMetricCard";
import { KPIData } from "../../../types/chatbotOverview";

interface ChatbotOverviewMetricsProps {
  kpiData: KPIData;
}

/**
 * Component untuk menampilkan 6 KPI metrics cards
 */
export const ChatbotOverviewMetrics: React.FC<ChatbotOverviewMetricsProps> = ({ kpiData }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <AnimatedMetricCard
        title="Total Pasien"
        value={kpiData.totalPatients}
        suffix=""
        icon={<Users className="h-5 w-5 text-blue-500" />}
        borderColor="border-blue-500"
        subtitle="Terdaftar di sistem"
        decimals={0}
      />
      
      <AnimatedMetricCard
        title="Sesi Aktif"
        value={kpiData.activeSessions}
        suffix=""
        icon={<Clock className="h-5 w-5 text-yellow-500" />}
        borderColor="border-yellow-500"
        subtitle="Sedang berlangsung"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Sesi Selesai"
        value={kpiData.completedSessions}
        suffix=""
        icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
        borderColor="border-green-600"
        subtitle="Total sesi completed"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Total Pesan"
        value={kpiData.totalMessages}
        suffix=""
        icon={<MessageSquare className="h-5 w-5 text-purple-500" />}
        borderColor="border-purple-500"
        subtitle="Semua percakapan"
        decimals={0}
        useLocaleString={true}
      />

      <AnimatedMetricCard
        title="Total Appointment"
        value={kpiData.totalAppointments}
        suffix=""
        icon={<Calendar className="h-5 w-5 text-indigo-500" />}
        borderColor="border-indigo-500"
        subtitle="Semua jadwal temu"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Appointment Pending"
        value={kpiData.pendingAppointments}
        suffix=""
        icon={<AlertCircle className="h-5 w-5 text-orange-500" />}
        borderColor="border-orange-500"
        subtitle="Menunggu konfirmasi"
        decimals={0}
      />
    </div>
  );
};
// components/crm/CRMMetrics.tsx

import { Users, Target, TrendingUp, UserCheck, Calendar } from "lucide-react";
import { AnimatedMetricCard } from "@/components/AnimatedMetricCard";
import { CRMMetrics as MetricsType } from "@/types/crmContacts";

interface CRMMetricsProps {
  metrics: MetricsType;
}

export const CRMMetrics = ({ metrics }: CRMMetricsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <AnimatedMetricCard
        title="Total Kontak"
        value={metrics.totalContacts}
        suffix=""
        icon={<Users className="h-5 w-5 text-blue-500" />}
        borderColor="border-blue-500"
        subtitle="Semua kontak"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Lead"
        value={metrics.leadContacts}
        suffix=""
        icon={<Target className="h-5 w-5 text-yellow-500" />}
        borderColor="border-yellow-500"
        subtitle="Kontak lead"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Qualified"
        value={metrics.qualifiedContacts}
        suffix=""
        icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
        borderColor="border-blue-500"
        subtitle="Lead qualified"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Customer"
        value={metrics.customerContacts}
        suffix=""
        icon={<UserCheck className="h-5 w-5 text-green-500" />}
        borderColor="border-green-500"
        subtitle="Active customer"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Hari Ini"
        value={metrics.todayContacts}
        suffix=""
        icon={<Calendar className="h-5 w-5 text-purple-500" />}
        borderColor="border-purple-500"
        subtitle="Kontak baru hari ini"
        decimals={0}
      />
    </div>
  );
};
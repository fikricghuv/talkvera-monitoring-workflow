// src/components/OperasionalBisnisToolUsage/OperasionalBisnisKPICards.tsx

import { Activity, CheckCircle, XCircle, Users, ShoppingCart, FileText, UserCog, Wrench } from 'lucide-react';
import { AnimatedMetricCard } from '@/components/AnimatedMetricCard';
import type { OperasionalBisnisOverviewKPI } from '@/types/operasionalBisnisToolUsage';
import { calculateSuccessRate } from '@/utils/operasionalBisnisToolUsageUtils';

interface OperasionalBisnisKPICardsProps {
  kpiData: OperasionalBisnisOverviewKPI;
}

export const OperasionalBisnisKPICards: React.FC<OperasionalBisnisKPICardsProps> = ({ kpiData }) => {
  const successRate = calculateSuccessRate(
    kpiData.successfulExecutions,
    kpiData.totalExecutions
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AnimatedMetricCard
        title="Total Executions"
        value={kpiData.totalExecutions}
        icon={<Activity className="h-5 w-5 text-blue-500" />}
        borderColor="border-blue-500"
        subtitle="Total eksekusi tool"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Successful"
        value={kpiData.successfulExecutions}
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
        borderColor="border-green-500"
        subtitle={`${successRate.toFixed(1)}% success rate`}
        decimals={0}
      />

      <AnimatedMetricCard
        title="Failed"
        value={kpiData.failedExecutions}
        icon={<XCircle className="h-5 w-5 text-red-500" />}
        borderColor="border-red-500"
        subtitle={`${((kpiData.failedExecutions / (kpiData.totalExecutions || 1)) * 100).toFixed(1)}% failure rate`}
        decimals={0}
      />

      <AnimatedMetricCard
        title="Total Users"
        value={kpiData.totalUsers}
        icon={<Users className="h-5 w-5 text-purple-500" />}
        borderColor="border-purple-500"
        subtitle="Pengguna aktif"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Transactions"
        value={kpiData.totalTransactions}
        icon={<ShoppingCart className="h-5 w-5 text-cyan-500" />}
        borderColor="border-cyan-500"
        subtitle="Operasi transaksi"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Content Ops"
        value={kpiData.totalContentOps}
        icon={<FileText className="h-5 w-5 text-orange-500" />}
        borderColor="border-orange-500"
        subtitle="Operasi konten"
        decimals={0}
      />

      <AnimatedMetricCard
        title="CRM Ops"
        value={kpiData.totalCRMOps}
        icon={<UserCog className="h-5 w-5 text-indigo-500" />}
        borderColor="border-indigo-500"
        subtitle="Operasi CRM"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Unique Tools"
        value={kpiData.uniqueTools}
        icon={<Wrench className="h-5 w-5 text-teal-500" />}
        borderColor="border-teal-500"
        subtitle="Tools digunakan"
        decimals={0}
      />
    </div>
  );
};

// src/components/AgentMonitoringKPI.tsx

import { MessageSquare, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { AnimatedMetricCard } from '@/components/AnimatedMetricCard';
import type { QueryMonitoringKPI } from '@/types/agentMonitoring';
import { formatResponseTime } from '@/utils/dataAgentUtils';

interface AgentMonitoringKPIProps {
  kpiData: QueryMonitoringKPI;
}

/**
 * KPI cards for query monitoring
 */
export const AgentMonitoringKPI: React.FC<AgentMonitoringKPIProps> = ({ kpiData }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Queries */}
      <AnimatedMetricCard
        title="Total Queries"
        value={kpiData.totalQueries}
        icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
        borderColor="border-blue-500"
        subtitle="Queries ditampilkan"
        decimals={0}
      />

      {/* Success Rate */}
      <AnimatedMetricCard
        title="Success Rate"
        value={kpiData.successRate}
        suffix=" %"
        icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
        borderColor="border-green-500"
        subtitle="Tingkat keberhasilan"
        decimals={1}
      />

      {/* Avg Response Time */}
      <AnimatedMetricCard
        title="Avg Response Time"
        value={kpiData.avgResponseTime}
        suffix=" ms"
        icon={<Clock className="h-5 w-5 text-purple-500" />}
        borderColor="border-purple-500"
        subtitle={formatResponseTime(kpiData.avgResponseTime)}
        decimals={0}
      />

      {/* Queries with Risks */}
      <AnimatedMetricCard
        title="Queries with Risks"
        value={kpiData.totalWithRisks}
        icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
        borderColor="border-orange-500"
        subtitle={`${((kpiData.totalWithRisks / (kpiData.totalQueries || 1)) * 100).toFixed(1)}% dari total`}
        decimals={0}
      />
    </div>
  );
};
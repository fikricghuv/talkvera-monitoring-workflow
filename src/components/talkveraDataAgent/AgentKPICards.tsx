// src/components/AgentKPICards.tsx

import { MessageSquare, CheckCircle, XCircle, Clock, Database, FileText, AlertTriangle, ShieldAlert } from 'lucide-react';
import { AnimatedMetricCard } from '@/components/AnimatedMetricCard';
import type { AgentOverviewKPI } from '@/types/dataAgent';
import { calculateSuccessRate, formatResponseTime } from '@/utils/dataAgentUtils';

interface AgentKPICardsProps {
  kpiData: AgentOverviewKPI;
}

/**
 * KPI cards section for agent overview
 */
export const AgentKPICards: React.FC<AgentKPICardsProps> = ({ kpiData }) => {
  const successRate = calculateSuccessRate(
    kpiData.successfulQueries,
    kpiData.totalQueries
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Queries */}
      <AnimatedMetricCard
        title="Total Queries"
        value={kpiData.totalQueries}
        icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
        borderColor="border-blue-500"
        subtitle="Total pertanyaan"
        decimals={0}
      />

      {/* Successful Queries */}
      <AnimatedMetricCard
        title="Successful Queries"
        value={kpiData.successfulQueries}
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
        borderColor="border-green-500"
        subtitle={`${successRate.toFixed(1)}% success rate`}
        decimals={0}
      />

      {/* Failed Queries */}
      <AnimatedMetricCard
        title="Failed Queries"
        value={kpiData.failedQueries}
        icon={<XCircle className="h-5 w-5 text-red-500" />}
        borderColor="border-red-500"
        subtitle={`${((kpiData.failedQueries / (kpiData.totalQueries || 1)) * 100).toFixed(1)}% failure rate`}
        decimals={0}
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

      {/* SQL Queries */}
      <AnimatedMetricCard
        title="SQL Queries"
        value={kpiData.totalSQLQueries}
        icon={<Database className="h-5 w-5 text-indigo-500" />}
        borderColor="border-indigo-500"
        subtitle="Menggunakan SQL"
        decimals={0}
      />

      {/* RAG Queries */}
      <AnimatedMetricCard
        title="RAG Queries"
        value={kpiData.totalRAGQueries}
        icon={<FileText className="h-5 w-5 text-cyan-500" />}
        borderColor="border-cyan-500"
        subtitle="Menggunakan RAG"
        decimals={0}
      />

      {/* Total Risks */}
      <AnimatedMetricCard
        title="Total Risks"
        value={kpiData.totalRisks}
        icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
        borderColor="border-orange-500"
        subtitle="Risk terdeteksi"
        decimals={0}
      />

      {/* High Severity Risks */}
      <AnimatedMetricCard
        title="High Severity Risks"
        value={kpiData.highSeverityRisks}
        icon={<ShieldAlert className="h-5 w-5 text-red-600" />}
        borderColor="border-red-600"
        subtitle="Risk prioritas tinggi"
        decimals={0}
      />
    </div>
  );
};
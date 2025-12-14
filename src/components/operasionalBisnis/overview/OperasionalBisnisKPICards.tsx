// src/components/operasionalBisnis/overview/OperasionalBisnisKPICards.tsx

import { 
  Users,
  UserPlus,
  MessageSquare,
  Calendar,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Target
} from 'lucide-react';
import { AnimatedMetricCard } from '@/components/AnimatedMetricCard';
import type { OperasionalBisnisOverviewKPI } from '@/types/operasionalBisnisToolUsage';

interface OperasionalBisnisKPICardsProps {
  kpiData: OperasionalBisnisOverviewKPI;
}

export const OperasionalBisnisKPICards: React.FC<OperasionalBisnisKPICardsProps> = ({ kpiData }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Row 1: Contact Metrics */}
      <AnimatedMetricCard
        title="Total Contacts"
        value={kpiData.totalContacts}
        icon={<Users className="h-5 w-5 text-blue-500" />}
        borderColor="border-blue-500"
        subtitle={`${kpiData.newContacts} contacts baru`}
        decimals={0}
      />

      <AnimatedMetricCard
        title="Qualified Leads"
        value={kpiData.qualifiedLeadsCount}
        icon={<Target className="h-5 w-5 text-cyan-500" />}
        borderColor="border-cyan-500"
        subtitle={`dari ${kpiData.leadsCount} total leads`}
        decimals={0}
      />

      <AnimatedMetricCard
        title="Customers"
        value={kpiData.customersCount}
        icon={<UserPlus className="h-5 w-5 text-green-500" />}
        borderColor="border-green-500"
        subtitle={`${kpiData.inactiveCount} inactive`}
        decimals={0}
      />

      <AnimatedMetricCard
        title="Conversion Rate"
        value={kpiData.lpToContactRate}
        icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
        borderColor="border-purple-500"
        subtitle="Session to Contact"
        decimals={1}
        suffix="%"
      />

      {/* Row 2: Session & Appointment Metrics */}
      <AnimatedMetricCard
        title="Total Sessions"
        value={kpiData.totalSessions}
        icon={<MessageSquare className="h-5 w-5 text-indigo-500" />}
        borderColor="border-indigo-500"
        subtitle={`${kpiData.completedSessions} completed`}
        decimals={0}
      />

      <AnimatedMetricCard
        title="Avg Messages"
        value={kpiData.avgMessagesPerSession}
        icon={<BarChart3 className="h-5 w-5 text-orange-500" />}
        borderColor="border-orange-500"
        subtitle="Per session"
        decimals={1}
      />

      <AnimatedMetricCard
        title="Total Appointments"
        value={kpiData.totalAppointments}
        icon={<Calendar className="h-5 w-5 text-pink-500" />}
        borderColor="border-pink-500"
        subtitle={`${kpiData.scheduledAppointments} scheduled`}
        decimals={0}
      />

      <AnimatedMetricCard
        title="Appointment Rate"
        value={kpiData.contactToAppointmentRate}
        icon={<CheckCircle className="h-5 w-5 text-teal-500" />}
        borderColor="border-teal-500"
        subtitle="Contact to Appointment"
        decimals={1}
        suffix="%"
      />
    </div>
  );
};
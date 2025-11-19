import { Users, UserCheck, UserX, CheckCircle2, Clock } from "lucide-react";
import { AnimatedMetricCard } from "../../AnimatedMetricCard";
import { PatientMetrics as MetricsType } from "@/types/patients";

interface PatientMetricsProps {
  metrics: MetricsType;
}

export const PatientMetrics = ({ metrics }: PatientMetricsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <AnimatedMetricCard
        title="Total Patients"
        value={metrics.totalPatients}
        suffix=""
        icon={<Users className="h-5 w-5 text-blue-500" />}
        borderColor="border-blue-500"
        subtitle="Semua pasien"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Male"
        value={metrics.malePatients}
        suffix=""
        icon={<UserCheck className="h-5 w-5 text-green-500" />}
        borderColor="border-green-500"
        subtitle="Pasien laki-laki"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Female"
        value={metrics.femalePatients}
        suffix=""
        icon={<UserX className="h-5 w-5 text-pink-500" />}
        borderColor="border-pink-500"
        subtitle="Pasien perempuan"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Completed Profiles"
        value={metrics.completedProfiles}
        suffix=""
        icon={<CheckCircle2 className="h-5 w-5 text-gray-600" />}
        borderColor="border-gray-600"
        subtitle="Profil lengkap"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Recent (7 Days)"
        value={metrics.recentPatients}
        suffix=""
        icon={<Clock className="h-5 w-5 text-purple-500" />}
        borderColor="border-purple-500"
        subtitle="Pasien baru"
        decimals={0}
      />
    </div>
  );
};
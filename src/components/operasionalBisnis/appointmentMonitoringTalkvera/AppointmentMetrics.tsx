import { Calendar, CalendarCheck, CalendarX, CheckCircle2, Clock } from "lucide-react";
import { AnimatedMetricCard } from "../../AnimatedMetricCard";
import { AppointmentMetrics as MetricsType } from "@/types/appointmentsTalkvera";

interface AppointmentMetricsProps {
  metrics: MetricsType;
}

export const AppointmentMetrics = ({ metrics }: AppointmentMetricsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <AnimatedMetricCard
        title="Total Appointments"
        value={metrics.totalAppointments}
        suffix=""
        icon={<Calendar className="h-5 w-5 text-blue-500" />}
        borderColor="border-blue-500"
        subtitle="Semua appointment"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Terjadwal"
        value={metrics.scheduledAppointments}
        suffix=""
        icon={<CalendarCheck className="h-5 w-5 text-green-500" />}
        borderColor="border-green-500"
        subtitle="Appointment terjadwal"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Selesai"
        value={metrics.completedAppointments}
        suffix=""
        icon={<CheckCircle2 className="h-5 w-5 text-gray-600" />}
        borderColor="border-gray-600"
        subtitle="Sudah selesai"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Dibatalkan"
        value={metrics.cancelledAppointments}
        suffix=""
        icon={<CalendarX className="h-5 w-5 text-red-500" />}
        borderColor="border-red-500"
        subtitle="Dibatalkan"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Hari Ini"
        value={metrics.todayAppointments}
        suffix=""
        icon={<Clock className="h-5 w-5 text-purple-500" />}
        borderColor="border-purple-500"
        subtitle="Appointment hari ini"
        decimals={0}
      />
    </div>
  );
};
import { MessageCircle, Activity, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { AnimatedMetricCard } from "../../AnimatedMetricCard";
import { ChatSessionMetrics as MetricsType } from "@/types/chatSessions";

interface ChatSessionMetricsProps {
  metrics: MetricsType;
}

export const ChatSessionMetrics = ({ metrics }: ChatSessionMetricsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <AnimatedMetricCard
        title="Total Sessions"
        value={metrics.totalSessions}
        suffix=""
        icon={<MessageCircle className="h-5 w-5 text-blue-500" />}
        borderColor="border-blue-500"
        subtitle="Semua sesi chat"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Active Sessions"
        value={metrics.activeSessions}
        suffix=""
        icon={<Activity className="h-5 w-5 text-green-500" />}
        borderColor="border-green-500"
        subtitle="Sedang berlangsung"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Completed"
        value={metrics.completedSessions}
        suffix=""
        icon={<CheckCircle2 className="h-5 w-5 text-gray-600" />}
        borderColor="border-gray-600"
        subtitle="Sudah selesai"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Today"
        value={metrics.todaySessions}
        suffix=""
        icon={<Clock className="h-5 w-5 text-purple-500" />}
        borderColor="border-purple-500"
        subtitle="Hari ini"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Avg Messages"
        value={metrics.avgMessagesPerSession}
        suffix=""
        icon={<TrendingUp className="h-5 w-5 text-orange-500" />}
        borderColor="border-orange-500"
        subtitle="Per session"
        decimals={0}
      />
    </div>
  );
};
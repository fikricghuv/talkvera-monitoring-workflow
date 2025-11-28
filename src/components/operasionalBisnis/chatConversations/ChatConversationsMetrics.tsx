import { MessageCircle, Users, Clock, ThumbsUp, TrendingUp } from "lucide-react";
import { AnimatedMetricCard } from "../../AnimatedMetricCard";
import { ChatConversationMetrics as MetricsType } from "@/types/chatConversations";

interface ChatConversationsMetricsProps {
  metrics: MetricsType;
}

export const ChatConversationsMetrics = ({ metrics }: ChatConversationsMetricsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <AnimatedMetricCard
        title="Total Conversations"
        value={metrics.totalConversations}
        suffix=""
        icon={<Users className="h-5 w-5 text-blue-500" />}
        borderColor="border-blue-500"
        subtitle="Unique senders"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Total Messages"
        value={metrics.totalMessages}
        suffix=""
        icon={<MessageCircle className="h-5 w-5 text-green-500" />}
        borderColor="border-green-500"
        subtitle="Semua pesan"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Today"
        value={metrics.todayConversations}
        suffix=""
        icon={<Clock className="h-5 w-5 text-orange-500" />}
        borderColor="border-orange-500"
        subtitle="Percakapan hari ini"
        decimals={0}
      />

      <AnimatedMetricCard
        title="With Feedback"
        value={metrics.conversationsWithFeedback}
        suffix=""
        icon={<ThumbsUp className="h-5 w-5 text-pink-500" />}
        borderColor="border-pink-500"
        subtitle="Ada feedback"
        decimals={0}
      />

      <AnimatedMetricCard
        title="Avg Messages"
        value={metrics.avgMessagesPerConversation}
        suffix=""
        icon={<TrendingUp className="h-5 w-5 text-indigo-500" />}
        borderColor="border-indigo-500"
        subtitle="Per conversation"
        decimals={0}
      />
    </div>
  );
};
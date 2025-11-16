// components/overview/SessionStatusChart.tsx

import React from "react";
import { SessionStatusDistribution } from "../../types/chatbotOverview";
import { SESSION_STATUS_CONFIG, CHART_COLORS } from "../../constants/chatbotOverview";
import { Loader2 } from "lucide-react";

interface SessionStatusChartProps {
  data: SessionStatusDistribution[];
  isLoading: boolean;
}

/**
 * Simple bar chart untuk menampilkan distribusi status session
 */
export const SessionStatusChart: React.FC<SessionStatusChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Memuat chart...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Tidak ada data untuk ditampilkan
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const config = SESSION_STATUS_CONFIG[item.status];
        const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
        const bgColor = CHART_COLORS[item.status as keyof typeof CHART_COLORS] || "#94a3b8";

        return (
          <div key={item.status} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{config?.label || item.status}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{item.count} sessions</span>
                <span className="font-semibold">{item.percentage}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: bgColor,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
// src/components/AgentResponseTimeChart.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AgentTimeSeriesData } from '@/types/dataAgent';
import { AGENT_CONSTANTS } from '@/constants/dataAgent';

interface AgentResponseTimeChartProps {
  data: AgentTimeSeriesData[];
}

/**
 * Response time chart
 */
export const AgentResponseTimeChart: React.FC<AgentResponseTimeChartProps> = ({ data }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Average Response Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              label={{ value: 'ms', angle: -90, position: 'insideLeft' }}
              style={{ fontSize: '12px' }}
            />
            <Tooltip formatter={(value) => `${Number(value).toFixed(0)} ms`} />
            <Bar
              dataKey="avgResponseTime"
              fill={AGENT_CONSTANTS.CHART_COLORS.info}
              name="Avg Response Time (ms)"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
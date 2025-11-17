// src/components/AgentTimeSeriesChart.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AgentTimeSeriesData } from '@/types/dataAgentOverview';
import { AGENT_CONSTANTS } from '@/constants/dataAgent';

interface AgentTimeSeriesChartProps {
  data: AgentTimeSeriesData[];
}

/**
 * Time series chart for query trends
 */
export const AgentTimeSeriesChart: React.FC<AgentTimeSeriesChartProps> = ({ data }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Query Trends Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              style={{ fontSize: '12px' }}
            />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="queries"
              stroke={AGENT_CONSTANTS.CHART_COLORS.primary}
              strokeWidth={2}
              name="Total Queries"
            />
            <Line
              type="monotone"
              dataKey="successful"
              stroke={AGENT_CONSTANTS.CHART_COLORS.success}
              strokeWidth={2}
              name="Successful"
            />
            <Line
              type="monotone"
              dataKey="failed"
              stroke={AGENT_CONSTANTS.CHART_COLORS.error}
              strokeWidth={2}
              name="Failed"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
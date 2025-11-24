// src/components/OperasionalBisnisToolUsage/OperasionalBisnisTimeSeriesChart.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { OperasionalBisnisTimeSeriesData } from '@/types/operasionalBisnisToolUsage';
import { OPS_CONSTANTS } from '@/constants/operasionalBisnisToolUsage';

interface OperasionalBisnisTimeSeriesChartProps {
  data: OperasionalBisnisTimeSeriesData[];
}

export const OperasionalBisnisTimeSeriesChart: React.FC<OperasionalBisnisTimeSeriesChartProps> = ({ data }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Execution Trends Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="executions"
              stroke={OPS_CONSTANTS.CHART_COLORS.primary}
              strokeWidth={2}
              name="Total Executions"
            />
            <Line
              type="monotone"
              dataKey="successful"
              stroke={OPS_CONSTANTS.CHART_COLORS.success}
              strokeWidth={2}
              name="Successful"
            />
            <Line
              type="monotone"
              dataKey="failed"
              stroke={OPS_CONSTANTS.CHART_COLORS.error}
              strokeWidth={2}
              name="Failed"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
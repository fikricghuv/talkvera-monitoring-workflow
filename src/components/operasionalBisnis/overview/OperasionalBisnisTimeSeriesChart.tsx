// src/components/operasionalBisnis/overview/OperasionalBisnisTimeSeriesChart.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { OperasionalBisnisTimeSeriesData } from '@/types/operasionalBisnisToolUsage';
import { OPS_CONSTANTS } from '@/constants/operasionalBisnisToolUsage';

interface Props {
  data: OperasionalBisnisTimeSeriesData[];
}

export const OperasionalBisnisTimeSeriesChart: React.FC<Props> = ({ data }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Activity Trends Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="contacts" stroke={OPS_CONSTANTS.CHART_COLORS.primary} strokeWidth={2} name="Contacts" />
            <Line type="monotone" dataKey="sessions" stroke={OPS_CONSTANTS.CHART_COLORS.purple} strokeWidth={2} name="Sessions" />
            <Line type="monotone" dataKey="appointments" stroke={OPS_CONSTANTS.CHART_COLORS.success} strokeWidth={2} name="Appointments" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
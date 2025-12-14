// src/components/operasionalBisnis/overview/OperasionalBisnisSessionStatusChart.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { SessionStatusDistribution } from '@/types/operasionalBisnisToolUsage';
import { OPS_CONSTANTS } from '@/constants/operasionalBisnisToolUsage';

interface Props {
  data: SessionStatusDistribution[];
}

const SESSION_COLOR_MAP: Record<string, string> = {
  'In Progress': OPS_CONSTANTS.SESSION_STATUS_COLORS.IN_PROGRESS,
  'Completed': OPS_CONSTANTS.SESSION_STATUS_COLORS.COMPLETED,
  'Abandoned': OPS_CONSTANTS.SESSION_STATUS_COLORS.ABANDONED,
};

export const OperasionalBisnisSessionStatusChart: React.FC<Props> = ({ data }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Session Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ status, percentage }) => `${status}: ${percentage.toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={SESSION_COLOR_MAP[entry.status] || '#6b7280'} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any, name: any, props: any) => [`${value} sessions`, props.payload.status]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
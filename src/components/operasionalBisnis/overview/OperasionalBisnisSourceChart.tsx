// src/components/operasionalBisnis/overview/OperasionalBisnisSourceChart.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { ContactSourceDistribution } from '@/types/operasionalBisnisToolUsage';
import { OPS_CONSTANTS } from '@/constants/operasionalBisnisToolUsage';

interface Props {
  data: ContactSourceDistribution[];
}

const SOURCE_COLOR_MAP: Record<string, string> = {
  'Landing Page': OPS_CONSTANTS.SOURCE_COLORS.landing_page,
  'WhatsApp': OPS_CONSTANTS.SOURCE_COLORS.whatsapp,
  'Manual': OPS_CONSTANTS.SOURCE_COLORS.manual,
};

export const OperasionalBisnisSourceChart: React.FC<Props> = ({ data }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Contact Source Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ source, percentage }) => `${source}: ${percentage.toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={SOURCE_COLOR_MAP[entry.source] || '#6b7280'} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any, name: any, props: any) => [`${value} contacts`, props.payload.source]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
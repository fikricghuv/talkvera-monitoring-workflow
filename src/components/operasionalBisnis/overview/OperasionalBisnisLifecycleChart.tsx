// src/components/operasionalBisnis/overview/OperasionalBisnisLifecycleChart.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import type { ContactLifecycleDistribution } from '@/types/operasionalBisnisToolUsage';
import { OPS_CONSTANTS } from '@/constants/operasionalBisnisToolUsage';

interface Props {
  data: ContactLifecycleDistribution[];
}

const LIFECYCLE_COLOR_MAP: Record<string, string> = {
  'Lead': OPS_CONSTANTS.LIFECYCLE_COLORS.lead,
  'Qualified': OPS_CONSTANTS.LIFECYCLE_COLORS.qualified,
  'Customer': OPS_CONSTANTS.LIFECYCLE_COLORS.customer,
  'Inactive': OPS_CONSTANTS.LIFECYCLE_COLORS.inactive,
};

export const OperasionalBisnisLifecycleChart: React.FC<Props> = ({ data }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Contact Lifecycle Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="lifecycle_stage" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip formatter={(value: any, name: any, props: any) => [`${value} contacts (${props.payload.percentage.toFixed(1)}%)`, '']} />
            <Legend />
            <Bar dataKey="count" name="Contacts">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={LIFECYCLE_COLOR_MAP[entry.lifecycle_stage] || '#6b7280'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
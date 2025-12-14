// src/components/operasionalBisnis/overview/OperasionalBisnisLeadStatusChart.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import type { LeadStatusDistribution } from '@/types/operasionalBisnisToolUsage';
import { OPS_CONSTANTS } from '@/constants/operasionalBisnisToolUsage';

interface Props {
  data: LeadStatusDistribution[];
}

const STATUS_COLOR_MAP: Record<string, string> = {
  'New': OPS_CONSTANTS.LEAD_STATUS_COLORS.new,
  'In Progress': OPS_CONSTANTS.LEAD_STATUS_COLORS.in_progress,
  'Follow Up': OPS_CONSTANTS.LEAD_STATUS_COLORS.follow_up,
  'Closed Won': OPS_CONSTANTS.LEAD_STATUS_COLORS.closed_won,
  'Closed Lost': OPS_CONSTANTS.LEAD_STATUS_COLORS.closed_lost,
};

export const OperasionalBisnisLeadStatusChart: React.FC<Props> = ({ data }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Lead Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="lead_status" style={{ fontSize: '11px' }} angle={-15} textAnchor="end" height={80} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip formatter={(value: any, name: any, props: any) => [`${value} leads`, '']} />
            <Legend />
            <Bar dataKey="count" name="Leads">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLOR_MAP[entry.lead_status] || '#6b7280'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
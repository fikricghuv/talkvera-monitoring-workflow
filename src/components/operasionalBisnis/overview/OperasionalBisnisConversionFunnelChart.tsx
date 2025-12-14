// src/components/operasionalBisnis/overview/OperasionalBisnisConversionFunnelChart.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ConversionFunnel } from '@/types/operasionalBisnisToolUsage';
import { OPS_CONSTANTS } from '@/constants/operasionalBisnisToolUsage';

interface Props {
  data: ConversionFunnel[];
}

export const OperasionalBisnisConversionFunnelChart: React.FC<Props> = ({ data }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Conversion Funnel by Source</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="source" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalSessions" fill={OPS_CONSTANTS.CHART_COLORS.purple} name="Sessions" />
            <Bar dataKey="contactsCreated" fill={OPS_CONSTANTS.CHART_COLORS.primary} name="Contacts" />
            <Bar dataKey="appointmentsBooked" fill={OPS_CONSTANTS.CHART_COLORS.success} name="Appointments" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
// src/components/operasionalBisnis/overview/OperasionalBisnisAppointmentStatusChart.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { AppointmentStatusDistribution } from '@/types/operasionalBisnisToolUsage';
import { OPS_CONSTANTS } from '@/constants/operasionalBisnisToolUsage';

interface Props {
  data: AppointmentStatusDistribution[];
}

const APPOINTMENT_COLOR_MAP: Record<string, string> = {
  'Scheduled': OPS_CONSTANTS.APPOINTMENT_STATUS_COLORS.scheduled,
  'Completed': OPS_CONSTANTS.APPOINTMENT_STATUS_COLORS.completed,
  'Canceled': OPS_CONSTANTS.APPOINTMENT_STATUS_COLORS.canceled,
  'Rescheduled': OPS_CONSTANTS.APPOINTMENT_STATUS_COLORS.rescheduled,
};

export const OperasionalBisnisAppointmentStatusChart: React.FC<Props> = ({ data }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Appointment Status Distribution</CardTitle>
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
                <Cell key={`cell-${index}`} fill={APPOINTMENT_COLOR_MAP[entry.status] || '#6b7280'} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any, name: any, props: any) => [`${value} appointments`, props.payload.status]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
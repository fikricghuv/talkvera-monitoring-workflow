// src/components/n8nToolUsage/N8NCategoryChart.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { ToolCategoryDistribution } from '@/types/operasionalBisnisToolUsage';

interface OperasionalBisnisCategoryChartProps {
  data: ToolCategoryDistribution[];
}

const COLORS = ['#06b6d4', '#f59e0b', '#8b5cf6', '#6b7280'];

export const OperasionalBisnisCategoryChart: React.FC<OperasionalBisnisCategoryChartProps> = ({ data }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Tool Category Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name, props) => [value, props.payload.category]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};


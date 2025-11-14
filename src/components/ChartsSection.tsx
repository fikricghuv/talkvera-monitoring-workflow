import { useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
} from "recharts";
import { ChartCard } from "./ChartCard";

interface ChartsSectionProps {
  dailyExecutions: Array<{ date: string; count: number; success: number; failed: number }>;
  topWorkflows: Array<{ name: string; count: number; successRate: number }>;
  costByDay: Array<{ date: string; cost: number }>;
  tokenUsage: Array<{ date: string; tokens: number }>;
}

export const ChartsSection = ({ 
  dailyExecutions, 
  topWorkflows,
  costByDay,
  tokenUsage
}: ChartsSectionProps) => {
  const combinedData = useMemo(() => {
    if (!costByDay || !tokenUsage) {
      return [];
    }
  
    const dataMap = new Map();
  
    costByDay.forEach(item => {
      dataMap.set(item.date, { 
        date: item.date, 
        cost: item.cost || 0,
        tokens: 0
      });
    });
  
    tokenUsage.forEach(item => {
      const existing = dataMap.get(item.date);
      if (existing) {
        existing.tokens = item.tokens || 0;
      } else {
        dataMap.set(item.date, {
          date: item.date,
          cost: 0,
          tokens: item.tokens || 0
        });
      }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const sortLogic = (a, b) => {
      const [dayA, monthA] = a.date.split(' ');
      const [dayB, monthB] = b.date.split(' ');
      const monthIndexA = monthNames.indexOf(monthA);
      const monthIndexB = monthNames.indexOf(monthB);
      if (monthIndexA !== monthIndexB) return monthIndexA - monthIndexB;
      return parseInt(dayA) - parseInt(dayB);
    };

    return Array.from(dataMap.values()).sort(sortLogic);
  
  }, [costByDay, tokenUsage]);

  return (
    <>
      {/* Daily Executions and Top Workflows */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Tren Eksekusi Harian">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyExecutions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="success" 
                stackId="a"
                fill="#22c55e" 
                name="Berhasil" 
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="failed" 
                stackId="a"
                fill="#ef4444" 
                name="Gagal" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top 5 Workflows">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topWorkflows} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar 
                dataKey="count" 
                fill="#3b82f6"
                name="Jumlah Eksekusi" 
                radius={[0, 8, 8, 0]}
                animationBegin={0}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Combined Cost & Token Chart */}
      <ChartCard title="Tren Biaya & Penggunaan Token Harian">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke="#3b82f6"
              label={{ value: 'Biaya (USD)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `$${value.toFixed(4)}`}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#10b981"
              label={{ value: 'Tokens', angle: 90, position: 'insideRight' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === "Biaya (USD)") {
                  return [`$${Number(value).toFixed(4)}`, name];
                }
                if (name === "Total Tokens") {
                  return [Number(value).toLocaleString(), name];
                }
                return [value, name];
              }} 
            />
            <Legend />
            <Bar 
              yAxisId="left" 
              dataKey="cost" 
              fill="#3b82f6"
              name="Biaya (USD)" 
              radius={[8, 8, 0, 0]}
              animationBegin={0}
              animationDuration={800}
            />
            <Bar 
              yAxisId="right" 
              dataKey="tokens" 
              fill="#10b981"
              name="Total Tokens" 
              radius={[8, 8, 0, 0]}
              animationBegin={0}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );
};
import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  CheckCircle, 
  RefreshCw,
  DollarSign,
  PlayCircle,
  Timer
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
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

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState("30days");

  const [customDates, setCustomDates] = useState(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  });

  useEffect(() => {
    fetchDashboardData();
  }, [periodFilter, customDates]);

  const formatDate = (date, format = "short") => {
    if (format === "short") {
      const day = date.getDate().toString().padStart(2, '0');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      return `${day} ${monthNames[date.getMonth()]}`;
    }
    return date.toLocaleDateString('id-ID');
  };

  const getDateRange = () => {
    const now = new Date();
    let startDate;
    let endDate = new Date(now);

    if (periodFilter === "custom") {
      const startParts = customDates.start.split('-').map(Number);
      const endParts = customDates.end.split('-').map(Number);
      
      startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
      endDate = new Date(endParts[0], endParts[1] - 1, endParts[2]);

    } else {
      switch (periodFilter) {
        case "7days":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "3months":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "30days":
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const { startDate, endDate } = getDateRange();

    try {
      const { data: workflowData, error: workflowError } = await supabase
        .from("dt_workflow_executions")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      if (workflowError) throw workflowError;

      // Fetch workflow information untuk mendapatkan time_saved_per_execution
      const { data: workflowInfoData, error: workflowInfoError } = await supabase
        .from("dt_workflow_information" as any)
        .select("workflow_id, time_saved_per_execution") as any;

      if (workflowInfoError) {
        console.error("Error fetching workflow info:", workflowInfoError);
      }

      // Buat map untuk akses cepat time_saved_per_execution berdasarkan workflow_id
      const timeSavedMap = new Map<string, number>();
      if (workflowInfoData && Array.isArray(workflowInfoData)) {
        workflowInfoData.forEach((info: any) => {
          timeSavedMap.set(info.workflow_id, info.time_saved_per_execution || 0);
        });
      }

      const successfulWorkflows = workflowData?.filter(w => w.status === "success" || !w.has_errors).length || 0;
      const failedWorkflows = workflowData?.filter(w => w.status === "error" || w.has_errors).length || 0;
      const runningWorkflows = workflowData?.filter(w => w.status === "running" || w.status === "waiting").length || 0;

      let totalTimeSaved = 0;
      workflowData?.forEach(execution => {
        // Filter hanya workflow yang sukses
        const isSuccess = execution.status === "success" || !execution.has_errors;
        
        if (isSuccess) {
          const workflowId = (execution as any).workflow_id;
          if (workflowId && timeSavedMap.has(workflowId)) {
            const timeSavedPerExecution = timeSavedMap.get(workflowId);
            totalTimeSaved += timeSavedPerExecution || 0;
          }
        }
      });
      
      const avgExecutionTime = workflowData?.length 
        ? workflowData.reduce((sum, w) => sum + (w.total_execution_time_ms || 0), 0) / workflowData.length 
        : 0;

      const totalTimeExecution = workflowData.reduce((sum, w) => sum + (w.total_execution_time_ms || 0), 0);
      const totalWorkflowCost = workflowData?.reduce((sum, w) => sum + (Number(w.estimated_cost_usd) || 0), 0) || 0;
      const totalWorkflowTokens = workflowData?.reduce((sum, w) => sum + (w.total_tokens || 0), 0) || 0;

      const dailyMap = new Map();
      workflowData?.forEach(w => {
        const date = formatDate(new Date(w.created_at));
        const existing = dailyMap.get(date) || { count: 0, success: 0, failed: 0 };
        dailyMap.set(date, {
          count: existing.count + 1,
          success: existing.success + (w.status === "success" || !w.has_errors ? 1 : 0),
          failed: existing.failed + (w.has_errors ? 1 : 0),
        });
      });

      const dailyExecutions = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => {
          const [dayA, monthA] = a.date.split(' ');
          const [dayB, monthB] = b.date.split(' ');
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
          const monthIndexA = monthNames.indexOf(monthA);
          const monthIndexB = monthNames.indexOf(monthB);
          if (monthIndexA !== monthIndexB) return monthIndexA - monthIndexB;
          return parseInt(dayA) - parseInt(dayB);
        })
        .slice(-14);

      const workflowMap = new Map();
      workflowData?.forEach(w => {
        const name = w.workflow_name || w.execution_id;
        const existing = workflowMap.get(name) || { count: 0, success: 0 };
        workflowMap.set(name, {
          count: existing.count + 1,
          success: existing.success + (w.status === "success" || !w.has_errors ? 1 : 0),
        });
      });

      const topWorkflows = Array.from(workflowMap.entries())
        .map(([name, data]) => ({
          name,
          count: data.count,
          successRate: data.count > 0 ? (data.success / data.count) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const costMap = new Map();
      workflowData?.forEach(w => {
        const date = formatDate(new Date(w.created_at));
        const cost = Number(w.estimated_cost_usd) || 0;
        costMap.set(date, (costMap.get(date) || 0) + cost);
      });

      const costByDay = Array.from(costMap.entries())
        .map(([date, cost]) => ({ date, cost: parseFloat(cost.toFixed(4)) }))
        .sort((a, b) => {
          const [dayA, monthA] = a.date.split(' ');
          const [dayB, monthB] = b.date.split(' ');
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
          const monthIndexA = monthNames.indexOf(monthA);
          const monthIndexB = monthNames.indexOf(monthB);
          if (monthIndexA !== monthIndexB) return monthIndexA - monthIndexB;
          return parseInt(dayA) - parseInt(dayB);
        })
        .slice(-14);

      const tokenMap = new Map();
      workflowData?.forEach(w => {
        const date = formatDate(new Date(w.created_at));
        tokenMap.set(date, (tokenMap.get(date) || 0) + (w.total_tokens || 0));
      });

      const tokenUsage = Array.from(tokenMap.entries())
        .map(([date, tokens]) => ({ date, tokens }))
        .sort((a, b) => {
          const [dayA, monthA] = a.date.split(' ');
          const [dayB, monthB] = b.date.split(' ');
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
          const monthIndexA = monthNames.indexOf(monthA);
          const monthIndexB = monthNames.indexOf(monthB);
          if (monthIndexA !== monthIndexB) return monthIndexA - monthIndexB;
          return parseInt(dayA) - parseInt(dayB);
        })
        .slice(-14);

      setMetrics({
        workflows: {
          total: workflowData?.length || 0,
          successful: successfulWorkflows,
          failed: failedWorkflows,
          running: runningWorkflows,
          avgExecutionTime: Math.round(avgExecutionTime),
          totalTimeExecution: totalTimeExecution,
          totalCost: totalWorkflowCost,
          totalTokens: totalWorkflowTokens,
          totalTimeSaved: totalTimeSaved, 
        },
        trends: {
          dailyExecutions,
          topWorkflows,
          costByDay,
          tokenUsage,
        },
      });

      toast.success("Data dashboard berhasil dimuat");
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Gagal memuat data dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    toast.info("Memuat ulang data...");
    fetchDashboardData();
  };

  const combinedData = useMemo(() => {
    if (!metrics?.trends?.costByDay || !metrics?.trends?.tokenUsage) {
      return [];
    }
  
    const dataMap = new Map();
  
    metrics.trends.costByDay.forEach(item => {
      dataMap.set(item.date, { 
        date: item.date, 
        cost: item.cost || 0,
        tokens: 0
      });
    });
  
    metrics.trends.tokenUsage.forEach(item => {
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
  
  }, [metrics]);

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6 pl-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <Skeleton className="h-9 w-48 mb-2" />
              <Skeleton className="h-5 w-80" />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>

          {/* Workflow Execution Metrics Skeleton */}
          <div>
            <Skeleton className="h-6 w-56 mb-3" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-lg border-l-4 border-gray-300 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-20 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          </div>

          {/* Charts Skeleton */}
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-[300px] w-full" />
              </div>
            ))}
          </div>

          {/* Combined Chart Skeleton */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Skeleton className="h-6 w-64 mb-4" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#22c55e', '#ef4444', '#eab308', '#3b82f6'];

  return (
   <div className="space-y-6 pl-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600 mt-1">Ringkasan eksekusi workflow dan antrian proses</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-end gap-2">
            <select 
              value={periodFilter} 
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
            >
              <option value="7days">7 Hari Terakhir</option>
              <option value="30days">30 Hari Terakhir</option>
              <option value="3months">3 Bulan Terakhir</option>
              <option value="custom">Periode Custom</option>
            </select>
            
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-accent hover:text-white transition-colors flex items-center gap-2 shadow-lg"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            
            {periodFilter === "custom" && (
              <div className="flex items-center gap-2 border-l pl-2">
                <input
                  type="date"
                  value={customDates.start}
                  onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">s/d</span>
                <input
                  type="date"
                  value={customDates.end}
                  onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Workflow Execution Metrics */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Metrik Workflow Execution</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatedMetricCard
              title="Total Eksekusi"
              value={metrics.workflows.total}
              icon={<PlayCircle className="h-5 w-5 text-blue-500" />}
              borderColor="border-blue-500"
              subtitle={
                <>
                  <span className="text-green-600">{metrics.workflows.successful} berhasil</span> · 
                  <span className="text-red-600 ml-1">{metrics.workflows.failed} gagal</span>
                </>
              }
            />
            <AnimatedMetricCard
              title="Success Rate"
              value={((metrics.workflows.successful / metrics.workflows.total) * 100).toFixed(1)}
              suffix="%"
              icon={<CheckCircle className="h-5 w-5 text-green-600" />}
              borderColor="border-green-600"
              subtitle="Tingkat keberhasilan"
              decimals={1}
            />
            <AnimatedMetricCard
              title="Avg Execution Time"
              value={(metrics.workflows.avgExecutionTime / 1000).toFixed(2)}
              suffix="s"
              icon={<Timer className="h-5 w-5 text-blue-900" />}
              borderColor="border-blue-900"
              subtitle="Rata-rata waktu eksekusi"
              decimals={2}
            />
            <AnimatedMetricCard
              title="Total Cost"
              value={metrics.workflows.totalCost.toFixed(4)}
              prefix="$"
              icon={<DollarSign className="h-5 w-5 text-green-800" />}
              borderColor="border-green-800"
              subtitle={`${metrics.workflows.totalTokens.toLocaleString()} tokens`}
              decimals={4}
            />
            <AnimatedMetricCard
              title="Total Time Saved"
              value={metrics.workflows.totalTimeSaved.toFixed(2)}
              suffix=" min"
              icon={<Clock className="h-5 w-5 text-purple-600" />}
              borderColor="border-purple-600"
              subtitle="Waktu yang dihemat"
              decimals={2}
            />
            <AnimatedMetricCard
              title="Total Waktu Eksekusi"
              value={(metrics.workflows.totalTimeExecution / 1000/60).toFixed(2)}
              suffix=" min"
              icon={<Timer className="h-5 w-5 text-orange-600" />}
              borderColor="border-orange-600"
              subtitle="Total waktu eksekusi"
              decimals={2}
            />
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Daily Executions Trend */}
          <ChartCard title="Tren Eksekusi Harian">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.trends.dailyExecutions}>
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

          {/* Top Workflows */}
          <ChartCard title="Top 5 Workflows">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.trends.topWorkflows} layout="vertical">
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
        {/* Tren Biaya & Token Harian (Gabungan) */}
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
      </div>
    </div>
  );
};

// Animated Counter Hook
const useCountUp = (end, duration = 2000, decimals = 0, prefix = '', suffix = '', useLocaleString = false) => {
  const [count, setCount] = useState(0);
  const [displayValue, setDisplayValue] = useState('0');
  const countRef = useRef(0);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const endValue = parseFloat(end) || 0;
    startTimeRef.current = null;
    countRef.current = 0;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      const currentCount = endValue * easeOut;
      countRef.current = currentCount;
      setCount(currentCount);

      if (useLocaleString) {
        setDisplayValue(Math.round(currentCount).toLocaleString());
      } else if (decimals > 0) {
        setDisplayValue(currentCount.toFixed(decimals));
      } else {
        setDisplayValue(Math.round(currentCount).toString());
      }

      if (percentage < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(endValue);
        if (useLocaleString) {
          setDisplayValue(Math.round(endValue).toLocaleString());
        } else if (decimals > 0) {
          setDisplayValue(endValue.toFixed(decimals));
        } else {
          setDisplayValue(Math.round(endValue).toString());
        }
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [end, duration, decimals, useLocaleString]);

  return `${prefix}${displayValue}${suffix}`;
};

// Animated MetricCard Component
const AnimatedMetricCard = ({ 
  title, 
  value, 
  icon, 
  borderColor, 
  subtitle, 
  decimals = 0, 
  prefix = '', 
  suffix = '',
  useLocaleString = false 
}) => {
  const animatedValue = useCountUp(value, 2000, decimals, prefix, suffix, useLocaleString);

  return (
    <div className={`bg-white rounded-lg shadow-lg border-l-4 ${borderColor} p-6 hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">{title}</h3>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{animatedValue}</div>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
};

// Reusable ChartCard Component
const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
};

export default Dashboard;
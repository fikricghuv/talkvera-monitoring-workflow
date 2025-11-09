import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Loader2, 
  RefreshCw,
  Zap,
  DollarSign,
  BarChart3,
  PlayCircle
} from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DashboardMetrics {
  queue: {
    pending: number;
    processing: number;
    done: number;
    failed: number;
    total: number;
  };
  workflows: {
    total: number;
    successful: number;
    failed: number;
    running: number;
    avgExecutionTime: number;
    totalCost: number;
    totalTokens: number;
  };
  nodes: {
    total: number;
    successful: number;
    failed: number;
    avgTokensPerExecution: number;
    totalCost: number;
  };
  trends: {
    dailyExecutions: Array<{ date: string; count: number; success: number; failed: number }>;
    topWorkflows: Array<{ name: string; count: number; successRate: number }>;
    costByDay: Array<{ date: string; cost: number }>;
    tokenUsage: Array<{ date: string; tokens: number }>;
  };
}

const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<string>("30days");

  useEffect(() => {
    fetchDashboardData();
  }, [periodFilter]);

  const formatDate = (date: Date, format: string = "short") => {
    if (format === "short") {
      const day = date.getDate().toString().padStart(2, '0');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      return `${day} ${monthNames[date.getMonth()]}`;
    }
    return date.toLocaleDateString('id-ID');
  };

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;

    switch (periodFilter) {
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "3months":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const { startDate, endDate } = getDateRange();

    try {
      // Fetch Queue Data
      const { data: queueData, error: queueError } = await supabase
        .from("dt_execution_process_queue")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (queueError) throw queueError;

      // Fetch Workflow Executions
      const { data: workflowData, error: workflowError } = await supabase
        .from("dt_workflow_executions")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      if (workflowError) throw workflowError;

      // Fetch Node Executions
      const { data: nodeData, error: nodeError } = await supabase
        .from("dt_node_executions")
        .select("*")
        .gte("inserted_at", startDate.toISOString())
        .lte("inserted_at", endDate.toISOString());

      if (nodeError) throw nodeError;

      // Process Queue Metrics
      const queueMetrics = {
        pending: queueData?.filter(q => q.status === "pending").length || 0,
        processing: queueData?.filter(q => q.status === "processing").length || 0,
        done: queueData?.filter(q => q.status === "done").length || 0,
        failed: queueData?.filter(q => q.status === "failed").length || 0,
        total: queueData?.length || 0,
      };

      // Process Workflow Metrics
      const successfulWorkflows = workflowData?.filter(w => w.status === "success" || !w.has_errors).length || 0;
      const failedWorkflows = workflowData?.filter(w => w.status === "error" || w.has_errors).length || 0;
      const runningWorkflows = workflowData?.filter(w => w.status === "running" || w.status === "waiting").length || 0;
      
      const avgExecutionTime = workflowData?.length 
        ? workflowData.reduce((sum, w) => sum + (w.total_execution_time_ms || 0), 0) / workflowData.length 
        : 0;

      const totalWorkflowCost = workflowData?.reduce((sum, w) => sum + (Number(w.estimated_cost_usd) || 0), 0) || 0;
      const totalWorkflowTokens = workflowData?.reduce((sum, w) => sum + (w.total_tokens || 0), 0) || 0;

      // Process Node Metrics
      const successfulNodes = nodeData?.filter(n => n.execution_status === "success" && !n.has_error).length || 0;
      const failedNodes = nodeData?.filter(n => n.has_error || n.execution_status === "error").length || 0;
      const avgTokensPerNode = nodeData?.length 
        ? nodeData.reduce((sum, n) => sum + (n.total_tokens || 0), 0) / nodeData.length 
        : 0;
      const totalNodeCost = nodeData?.reduce((sum, n) => sum + (Number(n.estimated_cost_usd) || 0), 0) || 0;

      // Calculate Daily Trends
      const dailyMap = new Map<string, { count: number; success: number; failed: number }>();
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
        .slice(-14);

      // Top Workflows
      const workflowMap = new Map<string, { count: number; success: number }>();
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

      // Cost by Day
      const costMap = new Map<string, number>();
      workflowData?.forEach(w => {
        const date = formatDate(new Date(w.created_at));
        const cost = Number(w.estimated_cost_usd) || 0;
        costMap.set(date, (costMap.get(date) || 0) + cost);
      });

      const costByDay = Array.from(costMap.entries())
        .map(([date, cost]) => ({ date, cost: parseFloat(cost.toFixed(4)) }))
        .slice(-14);

      // Token Usage by Day
      const tokenMap = new Map<string, number>();
      workflowData?.forEach(w => {
        const date = formatDate(new Date(w.created_at));
        tokenMap.set(date, (tokenMap.get(date) || 0) + (w.total_tokens || 0));
      });

      const tokenUsage = Array.from(tokenMap.entries())
        .map(([date, tokens]) => ({ date, tokens }))
        .slice(-14);

      setMetrics({
        queue: queueMetrics,
        workflows: {
          total: workflowData?.length || 0,
          successful: successfulWorkflows,
          failed: failedWorkflows,
          running: runningWorkflows,
          avgExecutionTime: Math.round(avgExecutionTime),
          totalCost: totalWorkflowCost,
          totalTokens: totalWorkflowTokens,
        },
        nodes: {
          total: nodeData?.length || 0,
          successful: successfulNodes,
          failed: failedNodes,
          avgTokensPerExecution: Math.round(avgTokensPerNode),
          totalCost: totalNodeCost,
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

  if (isLoading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat dashboard...</p>
      </div>
    );
  }

  const COLORS = ['#22c55e', '#ef4444', '#eab308', '#3b82f6'];

  const queuePieData = [
    { name: 'Done', value: metrics.queue.done },
    { name: 'Failed', value: metrics.queue.failed },
    { name: 'Pending', value: metrics.queue.pending },
    { name: 'Processing', value: metrics.queue.processing },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Ringkasan eksekusi workflow dan antrian proses</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Hari Terakhir</SelectItem>
              <SelectItem value="30days">30 Hari Terakhir</SelectItem>
              <SelectItem value="3months">3 Bulan Terakhir</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Workflow Execution Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Metrik Workflow Execution</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Eksekusi</CardTitle>
              <PlayCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.workflows.total}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{metrics.workflows.successful} berhasil</span> · 
                <span className="text-red-600 ml-1">{metrics.workflows.failed} gagal</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.workflows.total > 0 
                  ? ((metrics.workflows.successful / metrics.workflows.total) * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Tingkat keberhasilan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.workflows.avgExecutionTime / 1000).toFixed(2)}s
              </div>
              <p className="text-xs text-muted-foreground">Rata-rata waktu eksekusi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.workflows.totalCost.toFixed(4)}</div>
              <p className="text-xs text-muted-foreground">{metrics.workflows.totalTokens.toLocaleString()} tokens</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Node Execution Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Metrik Node Execution</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.nodes.total}</div>
              <p className="text-xs text-muted-foreground">Node yang dieksekusi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.nodes.total > 0 
                  ? ((metrics.nodes.successful / metrics.nodes.total) * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.nodes.successful} berhasil · {metrics.nodes.failed} gagal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Tokens/Node</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.nodes.avgTokensPerExecution.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Token per eksekusi node</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Node Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.nodes.totalCost.toFixed(4)}</div>
              <p className="text-xs text-muted-foreground">Total biaya node</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Queue Status Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Status Antrian Proses</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Antrian</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.queue.total}</div>
              <p className="text-xs text-muted-foreground">Total item</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.queue.pending}</div>
              <p className="text-xs text-muted-foreground">Menunggu proses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Zap className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.queue.processing}</div>
              <p className="text-xs text-muted-foreground">Sedang diproses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Done</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.queue.done}</div>
              <p className="text-xs text-muted-foreground">Selesai</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.queue.failed}</div>
              <p className="text-xs text-muted-foreground">Gagal</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Executions Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Eksekusi Harian</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.trends.dailyExecutions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Total" strokeWidth={2} />
                <Line type="monotone" dataKey="success" stroke="#22c55e" name="Berhasil" strokeWidth={2} />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Gagal" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Queue Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Status Antrian</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={queuePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {queuePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Workflows */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.trends.topWorkflows} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Jumlah Eksekusi" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Biaya Harian</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.trends.costByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(4)}`} />
                <Line type="monotone" dataKey="cost" stroke="#10b981" name="Biaya (USD)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Token Usage Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Tren Penggunaan Token</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.trends.tokenUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => Number(value).toLocaleString()} />
              <Bar dataKey="tokens" fill="#8b5cf6" name="Total Tokens" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
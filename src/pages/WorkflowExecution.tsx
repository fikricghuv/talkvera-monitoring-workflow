import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, AlertCircle, DollarSign, Zap, Loader2, Download, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

// --- Interface Workflow Execution (Tabel Induk) ---
interface WorkflowExecution {
  execution_id: string;
  workflow_name: string | null;
  status: string;
  created_at: string;
  total_execution_time_ms: number | null;
  estimated_cost_usd: number;
  total_tokens: number;
  has_errors: boolean;
  error_node_name: string | null;
  error_message: string | null;
}

interface RawExecutionData {
    execution_id: string;
    workflow_name: string | null;
    status: string;
    created_at: string;
    total_execution_time_ms: number | null;
    estimated_cost_usd: string | number;
    total_tokens: number;
    has_errors: boolean;
    error_node_name: string | null;
    error_message: string | null;
}

// --- Interface Node Execution (Tabel Detail Baru) ---
interface NodeExecution {
  node_name: string;
  execution_index: number | null;
  model_name: string | null;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  execution_time_ms: number | null;
  has_error: boolean;
  error_message: string | null;
  execution_status: string | null;
  estimated_cost_usd: number;
}

interface RawNodeExecution {
  node_name: string;
  execution_index: number | null;
  model_name: string | null;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  execution_time_ms: number | null;
  has_error: boolean;
  error_message: string | null;
  execution_status: string | null;
  estimated_cost_usd: string | number;
}

// --- Interface KPI (Tetap) ---
interface KPIData {
  totalExecutions: number;
  failedExecutions: number;
  totalCost: number;
  totalTokens: number;
}

const WorkflowExecution = () => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [kpiData, setKpiData] = useState<KPIData>({
    totalExecutions: 0,
    failedExecutions: 0,
    totalCost: 0,
    totalTokens: 0,
  });
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uniqueStatuses, setUniqueStatuses] = useState<string[]>([]);

  // Fetch KPI data
  const fetchKPIData = async () => {
    try {
      // Build base query for KPI with filters
      let baseQuery = supabase.from("dt_workflow_executions").select("*", { count: 'exact', head: false });

      // Apply search filter to KPI
      if (searchTerm) {
        baseQuery = baseQuery.or(`workflow_name.ilike.%${searchTerm}%,execution_id.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`);
      }

      // Apply status filter to KPI
      if (statusFilter !== "all") {
        baseQuery = baseQuery.eq("status", statusFilter);
      }

      // Apply period filter to KPI
      if (periodFilter !== "all") {
        const now = new Date();
        let startDate: Date | null = null;

        switch (periodFilter) {
          case "today":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "custom":
            if (customStartDate) {
              startDate = new Date(customStartDate);
            }
            break;
        }

        if (startDate) {
          baseQuery = baseQuery.gte("created_at", startDate.toISOString());
        }

        if (periodFilter === "custom" && customEndDate) {
          const endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
          baseQuery = baseQuery.lte("created_at", endDate.toISOString());
        }
      }

      const { data: kpiRawData, error } = await baseQuery;

      if (error) {
        console.error("Error fetching KPI:", error);
        return;
      }

      const kpiData = (kpiRawData as unknown) as RawExecutionData[] | null;
      const safeKpiData = kpiData || [];

      // Calculate KPI from filtered data
      const totalCost = safeKpiData.reduce((sum, e) => sum + Number(e.estimated_cost_usd || 0), 0);
      const totalTokens = safeKpiData.reduce((sum, e) => sum + (e.total_tokens || 0), 0);
      const failedCount = safeKpiData.filter(e => e.has_errors).length;

      setKpiData({
        totalExecutions: safeKpiData.length,
        failedExecutions: failedCount,
        totalCost,
        totalTokens,
      });
    } catch (error) {
      console.error("Error in fetchKPIData:", error);
    }
  };

  // Fetch unique statuses for filter dropdown
  const fetchUniqueStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from("dt_workflow_executions")
        .select("status")
        .order("status");

      if (error) {
        console.error("Error fetching statuses:", error);
        return;
      }

      const statuses = Array.from(new Set(data.map(d => d.status).filter(Boolean))).sort();
      setUniqueStatuses(statuses);
    } catch (error) {
      console.error("Error in fetchUniqueStatuses:", error);
    }
  };

  // Fetch paginated data dengan filter
  const fetchData = async () => {
    setIsLoading(true);

    try {
      // Build query dengan filter
      let query = supabase
        .from("dt_workflow_executions")
        .select("execution_id, workflow_name, status, created_at, total_execution_time_ms, estimated_cost_usd, total_tokens, has_errors, error_node_name, error_message", { count: 'exact' });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`workflow_name.ilike.%${searchTerm}%,execution_id.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`);
      }

      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      // Apply period filter
      if (periodFilter !== "all") {
        const now = new Date();
        let startDate: Date | null = null;

        switch (periodFilter) {
          case "today":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "custom":
            if (customStartDate) {
              startDate = new Date(customStartDate);
            }
            break;
        }

        if (startDate) {
          query = query.gte("created_at", startDate.toISOString());
        }

        if (periodFilter === "custom" && customEndDate) {
          const endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
          query = query.lte("created_at", endDate.toISOString());
        }
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      query = query
        .order("created_at", { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching executions:", error);
        toast.error("Gagal memuat data eksekusi");
        setIsLoading(false);
        return;
      }

      const unknownData = data as unknown;
      const rawData = unknownData as RawExecutionData[] | null; 
      const safeRawData = rawData || [];

      const processedData: WorkflowExecution[] = safeRawData.map((e) => ({
        execution_id: e.execution_id,
        workflow_name: e.workflow_name,
        status: e.status,
        created_at: e.created_at,
        total_execution_time_ms: e.total_execution_time_ms ? Number(e.total_execution_time_ms) : null,
        estimated_cost_usd: Number(e.estimated_cost_usd || 0),
        total_tokens: e.total_tokens || 0,
        has_errors: e.has_errors,
        error_node_name: e.error_node_name,
        error_message: e.error_message,
      }));
      
      setExecutions(processedData);
      setTotalCount(count || 0);

      // Fetch KPI data
      await fetchKPIData();
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error in fetchData:", error);
      toast.error("Terjadi kesalahan saat memuat data");
      setIsLoading(false);
    }
  };

  // Initial load - fetch unique statuses
  useEffect(() => {
    fetchUniqueStatuses();
  }, []);

  // Fetch data saat component mount atau filter/pagination berubah
  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, periodFilter, customStartDate, customEndDate]);

  // Reset ke halaman 1 saat filter berubah (kecuali pagination)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, periodFilter, customStartDate, customEndDate]);

  const getStatusBadge = (status: string | null) => {
    const statusKey = status?.toLowerCase() || 'cancelled';
    const variants: Record<string, { variant: "default" | "destructive" | "secondary" | "outline", className: string }> = {
      success: { variant: "default", className: "bg-green-500 text-white hover:bg-green-600" },
      error: { variant: "destructive", className: "" },
      running: { variant: "secondary", className: "bg-yellow-500 text-black hover:bg-yellow-600" },
      cancelled: { variant: "outline", className: "" },
      skipped: { variant: "outline", className: "border-gray-400 text-gray-600" }
    };

    const config = variants[statusKey] || variants.cancelled;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'}
      </Badge>
    );
  };

  const formatExecutionTime = (ms: number | undefined | null) => {
    if (ms === undefined || ms === null) return "-";
    if (ms >= 1000) {
      return (ms / 1000).toFixed(2) + "s";
    }
    return ms.toFixed(0) + "ms";
  };

  const handleRowClick = (execution: WorkflowExecution) => {
    setSelectedExecution(execution);
    setIsModalOpen(true);
  };

  // Pagination Logic
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    toast.info("Memuat ulang data...");
    fetchData();
  };

  // Download Report Function (CSV) - menggunakan data yang sudah difilter
  const handleDownloadReport = async () => {
    try {
      toast.info("Mengunduh report...");
      
      // Fetch all filtered data untuk export (tanpa pagination)
      let exportQuery = supabase
        .from("dt_workflow_executions")
        .select("execution_id, workflow_name, status, created_at, total_execution_time_ms, estimated_cost_usd, total_tokens, has_errors, error_node_name, error_message");

      // Apply same filters
      if (searchTerm) {
        exportQuery = exportQuery.or(`workflow_name.ilike.%${searchTerm}%,execution_id.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== "all") {
        exportQuery = exportQuery.eq("status", statusFilter);
      }

      if (periodFilter !== "all") {
        const now = new Date();
        let startDate: Date | null = null;

        switch (periodFilter) {
          case "today":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "custom":
            if (customStartDate) {
              startDate = new Date(customStartDate);
            }
            break;
        }

        if (startDate) {
          exportQuery = exportQuery.gte("created_at", startDate.toISOString());
        }

        if (periodFilter === "custom" && customEndDate) {
          const endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
          exportQuery = exportQuery.lte("created_at", endDate.toISOString());
        }
      }

      exportQuery = exportQuery.order("created_at", { ascending: false });

      const { data, error } = await exportQuery;

      if (error) {
        console.error("Error fetching export data:", error);
        toast.error("Gagal mengunduh report");
        return;
      }

      const rawData = (data as unknown) as RawExecutionData[] | null;
      const exportData = rawData || [];

      const headers = [
        'Execution ID', 'Workflow Name', 'Status', 'Created At',
        'Execution Time (ms)', 'Cost (USD)', 'Total Tokens', 
        'Has Errors', 'Error Node', 'Error Message'
      ];

      const rows = exportData.map(exec => [
        exec.execution_id,
        exec.workflow_name || 'N/A',
        exec.status,
        new Date(exec.created_at).toLocaleString('id-ID'),
        exec.total_execution_time_ms || 0,
        Number(exec.estimated_cost_usd || 0).toFixed(6),
        exec.total_tokens,
        exec.has_errors ? 'Yes' : 'No',
        exec.error_node_name || '-',
        (exec.error_message || '-').replace(/"/g, '""'),
      ]);

      const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `workflow-executions-report_${timestamp}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Report berhasil diunduh");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Terjadi kesalahan saat mengunduh report");
    }
  };

  // --- KOMPONEN BARU UNTUK KONTEN MODAL ---
  const ExecutionDetailContent = ({ execution }: { execution: WorkflowExecution | null }) => {
    const [nodeExecutions, setNodeExecutions] = useState<NodeExecution[]>([]);
    const [isNodeLoading, setIsNodeLoading] = useState(true);

    useEffect(() => {
      if (!execution?.execution_id) return;

      const fetchNodes = async () => {
        setIsNodeLoading(true);
        const { data, error } = await supabase
          .from("dt_node_executions")
          .select("node_name, execution_index, model_name, total_tokens, prompt_tokens, completion_tokens, execution_time_ms, has_error, error_message, execution_status, estimated_cost_usd")
          .eq("execution_id", execution.execution_id)
          .order("execution_index", { ascending: true });

        if (error) {
          console.error("Error fetching node executions:", error);
          setIsNodeLoading(false);
          return;
        }
        
        const rawData = (data as unknown) as RawNodeExecution[] | null;
        const safeRawData = rawData || [];

        const processedData: NodeExecution[] = safeRawData.map((n) => ({
          node_name: n.node_name,
          execution_index: n.execution_index,
          model_name: n.model_name,
          total_tokens: n.total_tokens || 0,
          prompt_tokens: n.prompt_tokens || 0,
          completion_tokens: n.completion_tokens || 0,
          execution_time_ms: n.execution_time_ms ? Number(n.execution_time_ms) : null,
          has_error: n.has_error,
          error_message: n.error_message,
          execution_status: n.execution_status,
          estimated_cost_usd: Number(n.estimated_cost_usd || 0),
        }));
        
        setNodeExecutions(processedData);
        setIsNodeLoading(false);
      };

      fetchNodes();
    }, [execution?.execution_id]);

    if (!execution) return null;

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Workflow Name</p>
              <p className="text-base font-semibold">{execution.workflow_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="mt-1">{getStatusBadge(execution.status)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Waktu Eksekusi</p>
              <p className="text-base">{formatExecutionTime(execution.total_execution_time_ms)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Biaya (USD)</p>
              <p className="text-base font-mono">${execution.estimated_cost_usd.toFixed(6)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
              <p className="text-base">{execution.total_tokens.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Has Errors</p>
              <Badge variant={execution.has_errors ? "destructive" : "default"} className={!execution.has_errors ? "bg-green-500 text-white hover:bg-green-600" : ""}>
                {execution.has_errors ? "Yes" : "No"}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Execution ID</p>
            <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{execution.execution_id}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Waktu Dibuat</p>
            <p className="text-sm">{format(new Date(execution.created_at), "dd MMMM yyyy, HH:mm:ss", { locale: id })}</p>
          </div>

          {execution.has_errors && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-1">Eksekusi ini memiliki error</p>
                <p className="text-sm font-medium">Node: **{execution.error_node_name || 'N/A'}**</p>
                <p className="text-sm mt-1">Pesan Error: {execution.error_message || 'Tidak ada pesan error.'}</p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-3 pt-4 border-t">
          <h3 className="text-lg font-semibold">Ringkasan Step Node</h3>
          {isNodeLoading ? (
            <div className="flex items-center justify-center p-6 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p>Memuat step node...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px] text-center">Step</TableHead>
                    <TableHead>Node</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nodeExecutions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Tidak ada data node untuk eksekusi ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    nodeExecutions.map((node, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-center font-mono">{node.execution_index ?? idx + 1}</TableCell>
                        <TableCell className="font-medium">{node.node_name}</TableCell>
                        <TableCell>{getStatusBadge(node.execution_status ?? (node.has_error ? 'error' : 'success'))}</TableCell>
                        <TableCell className="text-xs">{node.model_name || '-'}</TableCell>
                        <TableCell>{formatExecutionTime(node.execution_time_ms)}</TableCell>
                        <TableCell className="font-mono">{node.total_tokens.toLocaleString()}</TableCell>
                        <TableCell 
                          className="text-xs text-destructive max-w-[150px] truncate" 
                          title={node.error_message || undefined}
                        >
                          {node.has_error ? (node.error_message || 'Error') : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading && executions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pl-4 bg-gray-50 min-h-screen">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Workflow Executions</h2>
        <p className="text-muted-foreground">Monitor dan analisis eksekusi workflow</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg border-l-4 border-blue-500 transition-shadow hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eksekusi</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalExecutions}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-red-500 transition-shadow hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eksekusi Gagal</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.failedExecutions}</div>
            <p className="text-xs text-destructive">
              {kpiData.totalExecutions > 0
                ? `${((kpiData.failedExecutions / kpiData.totalExecutions) * 100).toFixed(1)}% dari total`
                : "Tidak ada data"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-green-600 transition-shadow hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Biaya (USD)</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpiData.totalCost.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">Estimasi biaya AI</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-green-800 transition-shadow hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Zap className="h-4 w-4 text-blue-800" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total token digunakan</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Input
                placeholder="Cari workflow, ID, atau status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Periode</SelectItem>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="week">7 Hari Terakhir</SelectItem>
                <SelectItem value="month">Bulan Ini</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {periodFilter === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Tanggal Mulai</label>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tanggal Akhir</label>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Riwayat Eksekusi ({totalCount})</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Menampilkan {totalCount > 0 ? startIndex + 1 : 0}-{endIndex} dari {totalCount} data
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={handleDownloadReport}
              variant="default"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              disabled={totalCount === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Execution ID</TableHead>
                  <TableHead>Workflow Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waktu Dibuat</TableHead>
                  <TableHead>Waktu Eksekusi</TableHead>
                  <TableHead>Biaya (USD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : executions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {searchTerm || statusFilter !== "all" || periodFilter !== "all" 
                        ? "Tidak ada data yang sesuai dengan filter" 
                        : "Belum ada data eksekusi"}
                    </TableCell>
                  </TableRow>
                ) : (
                  executions.map((execution) => (
                    <TableRow 
                      key={execution.execution_id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(execution)}
                    >
                      <TableCell className="font-mono text-xs">
                        {execution.execution_id}
                      </TableCell>
                      <TableCell className="font-medium">{execution.workflow_name || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(execution.status)}</TableCell>
                      <TableCell>
                        {format(new Date(execution.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                      </TableCell>
                      <TableCell>{formatExecutionTime(execution.total_execution_time_ms)}</TableCell>
                      <TableCell>${execution.estimated_cost_usd.toFixed(4)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tampilkan per halaman:</span>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        className="w-10"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Workflow Execution</DialogTitle>
            <DialogDescription>
              Informasi lengkap dari workflow execution dan ringkasan step node.
            </DialogDescription>
          </DialogHeader>
          
          <ExecutionDetailContent execution={selectedExecution} />

        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowExecution;
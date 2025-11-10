import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Info, Search, Loader2, Download, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface NodeExecution {
  id: string;
  execution_id: string;
  node_name: string;
  node_type: string | null;
  node_id: string | null;
  parent_node_name: string | null;
  
  execution_status: string | null;
  execution_time_ms: number | null;
  execution_index: number | null;
  sub_run_index: number | null;
  start_time: number | null;
  
  estimated_cost_usd: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_tokens: number | null;
  token_estimation_accuracy: number | null;
  
  has_error: boolean;
  error_message: string | null;
  error_name: string | null;
  error_stack: string | null;
  
  model_name: string | null;
  finish_reason: string | null;
  
  input_items_count: number;
  output_items_count: number;
  output_summary: string | null;
  
  source_nodes: any;
  node_parameters: any;
  prompt_messages: any;
  model_config: any;
  output_data_sample: any;
  
  inserted_at: string;
}

interface RawNodeExecution extends Omit<NodeExecution, 'estimated_cost_usd' | 'token_estimation_accuracy'> {
  estimated_cost_usd: string | number;
  token_estimation_accuracy: string | number | null;
}

interface MetricsData {
  totalNodes: number;
  successNodes: number;
  errorNodes: number;
  totalCost: number;
  totalTokens: number;
  avgExecutionTime: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
}

const DetailExecution = () => {
  const [nodeExecutions, setNodeExecutions] = useState<NodeExecution[]>([]);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [executionIdFilter, setExecutionIdFilter] = useState<string>("all");
  
  // Modal State
  const [selectedNode, setSelectedNode] = useState<NodeExecution | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Unique values for filters
  const [uniqueStatuses, setUniqueStatuses] = useState<string[]>([]);
  const [uniqueExecutionIds, setUniqueExecutionIds] = useState<string[]>([]);

  useEffect(() => {
    fetchUniqueValues();
  }, []);

  useEffect(() => {
    fetchNodeExecutions();
    fetchMetrics();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, executionIdFilter]);

  const fetchUniqueValues = async () => {
    try {
      // Fetch unique statuses
      const { data: statusData } = await supabase
        .from("dt_node_executions")
        .select("execution_status")
        .not("execution_status", "is", null);
      
      if (statusData) {
        const statuses = Array.from(new Set(statusData.map(d => d.execution_status))).sort();
        setUniqueStatuses(statuses as string[]);
      }

      // Fetch unique execution IDs
      const { data: execIdData } = await supabase
        .from("dt_node_executions")
        .select("execution_id")
        .not("execution_id", "is", null)
        .order("inserted_at", { ascending: false })
        .limit(50);
      
      if (execIdData) {
        const execIds = Array.from(new Set(execIdData.map(d => d.execution_id)));
        setUniqueExecutionIds(execIds as string[]);
      }
    } catch (error) {
      console.error("Error fetching unique values:", error);
    }
  };

  const fetchNodeExecutions = async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from("dt_node_executions")
        .select("*", { count: 'exact' });

      // Apply filters
      if (searchTerm) {
        query = query.or(`node_name.ilike.%${searchTerm}%,node_type.ilike.%${searchTerm}%,model_name.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq("execution_status", statusFilter);
      }

      if (executionIdFilter !== "all") {
        query = query.eq("execution_id", executionIdFilter);
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await query
        .order("inserted_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const rawData = (data as unknown) as RawNodeExecution[] | null;
      const safeRawData = rawData || [];

      const processedData: NodeExecution[] = safeRawData.map((raw) => ({
        ...raw,
        estimated_cost_usd: Number(raw.estimated_cost_usd || 0),
        token_estimation_accuracy: raw.token_estimation_accuracy ? Number(raw.token_estimation_accuracy) : null,
      }));
      
      setNodeExecutions(processedData);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching node executions:", error);
      toast.error("Gagal memuat data eksekusi");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      let query = supabase
        .from("dt_node_executions")
        .select("*");

      // Apply same filters as main query
      if (searchTerm) {
        query = query.or(`node_name.ilike.%${searchTerm}%,node_type.ilike.%${searchTerm}%,model_name.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq("execution_status", statusFilter);
      }

      if (executionIdFilter !== "all") {
        query = query.eq("execution_id", executionIdFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const rawData = (data as unknown) as RawNodeExecution[] | null;
        const safeData = rawData || [];

        const processedData: NodeExecution[] = safeData.map((raw) => ({
          ...raw,
          estimated_cost_usd: Number(raw.estimated_cost_usd || 0),
          token_estimation_accuracy: raw.token_estimation_accuracy ? Number(raw.token_estimation_accuracy) : null,
        }));

        const totalNodes = processedData.length;
        const errorNodes = processedData.filter(n => n.has_error).length;
        const successNodes = processedData.filter(n => n.execution_status === "success").length;
        
        const totalCost = processedData.reduce((sum, n) => sum + Number(n.estimated_cost_usd || 0), 0);
        const totalTokens = processedData.reduce((sum, n) => sum + (n.total_tokens || 0), 0);
        const totalPromptTokens = processedData.reduce((sum, n) => sum + (n.prompt_tokens || 0), 0);
        const totalCompletionTokens = processedData.reduce((sum, n) => sum + (n.completion_tokens || 0), 0);
        
        const totalTime = processedData.reduce((sum, n) => sum + (n.execution_time_ms || 0), 0);
        const avgExecutionTime = totalNodes > 0 ? totalTime / totalNodes : 0;

        setMetrics({
          totalNodes,
          successNodes,
          errorNodes,
          totalCost,
          totalTokens,
          avgExecutionTime,
          totalPromptTokens,
          totalCompletionTokens,
        });
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>;
    
    const lowerStatus = status.toLowerCase();
    const variants: Record<string, { variant: "default" | "destructive" | "secondary" | "outline", className: string }> = {
      success: { variant: "default", className: "bg-green-500 text-white hover:bg-green-600" },
      error: { variant: "destructive", className: "bg-red-500 text-white hover:bg-red-600" },
      running: { variant: "default", className: "bg-blue-500 text-white hover:bg-blue-600" },
      skipped: { variant: "outline", className: "border-gray-400 text-gray-600" },
      default: { variant: "secondary", className: "" },
    };

    const config = variants[lowerStatus] || variants.default;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatExecutionTime = (ms: number | null) => {
    if (!ms) return "N/A";
    if (ms >= 1000) {
      return (ms / 1000).toFixed(2) + "s";
    }
    return ms.toFixed(0) + "ms";
  };

  const handleRowClick = (node: NodeExecution) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

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
    fetchNodeExecutions();
    fetchMetrics();
    fetchUniqueValues();
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  useEffect(() => {
    handleFilterChange();
  }, [searchTerm, statusFilter, executionIdFilter]);

  const handleDownloadReport = async () => {
    toast.info("Memproses download report...");
    
    try {
      let query = supabase
        .from("dt_node_executions")
        .select("*");

      if (searchTerm) {
        query = query.or(`node_name.ilike.%${searchTerm}%,node_type.ilike.%${searchTerm}%,model_name.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq("execution_status", statusFilter);
      }

      if (executionIdFilter !== "all") {
        query = query.eq("execution_id", executionIdFilter);
      }

      const { data, error } = await query
        .order("inserted_at", { ascending: false })
        .limit(1000);

      if (error) throw error;

      const rawData = (data as unknown) as RawNodeExecution[] | null;
      const safeRawData = rawData || [];

      const processedData: NodeExecution[] = safeRawData.map((raw) => ({
        ...raw,
        estimated_cost_usd: Number(raw.estimated_cost_usd || 0),
        token_estimation_accuracy: raw.token_estimation_accuracy ? Number(raw.token_estimation_accuracy) : null,
      }));

      const headers = [
        'Execution ID', 'Node Name', 'Node Type', 'Model', 'Status',
        'Execution Time (ms)', 'Prompt Tokens', 'Completion Tokens', 
        'Total Tokens', 'Cost (USD)', 'Input Items', 'Output Items',
        'Has Error', 'Error Message', 'Finish Reason', 'Created At'
      ];

      const rows = processedData.map(node => [
        node.execution_id,
        node.node_name,
        node.node_type || 'N/A',
        node.model_name || '-',
        node.execution_status || 'Unknown',
        node.execution_time_ms || 0,
        node.prompt_tokens,
        node.completion_tokens,
        node.total_tokens,
        Number(node.estimated_cost_usd).toFixed(6),
        node.input_items_count,
        node.output_items_count,
        node.has_error ? 'Yes' : 'No',
        (node.error_message || '-').replace(/"/g, '""'),
        node.finish_reason || 'N/A',
        new Date(node.inserted_at).toLocaleString('id-ID'),
      ]);

      const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `execution-log-report_${timestamp}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Report berhasil didownload!");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Gagal mendownload report");
    }
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-96 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pl-4 bg-gray-50 min-h-screen">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-800">Execution Log Dashboard</h2>
        <p className="text-muted-foreground">Ringkasan dan detail semua eksekusi node dari sistem alur kerja Anda.</p>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-lg border-l-4 border-blue-500 transition-shadow hover:shadow-xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Nodes</CardTitle>
              <Info className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalNodes}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-green-500 transition-shadow hover:shadow-xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
              <Loader2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.totalNodes > 0 
                  ? ((metrics.successNodes / metrics.totalNodes) * 100).toFixed(1) 
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.successNodes} sukses, {metrics.errorNodes} error
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-yellow-500 transition-shadow hover:shadow-xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Execution</CardTitle>
              <Info className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatExecutionTime(metrics.avgExecutionTime)}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-l-4 border-purple-500 transition-shadow hover:shadow-xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle>
              <Info className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">${metrics.totalCost.toFixed(4)}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-orange-500 transition-shadow hover:shadow-xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tokens</CardTitle>
              <Info className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalTokens.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Prompt: {metrics.totalPromptTokens.toLocaleString()} | Completion: {metrics.totalCompletionTokens.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-red-500 transition-shadow hover:shadow-xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Error Rate</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {metrics.totalNodes > 0 
                  ? ((metrics.errorNodes / metrics.totalNodes) * 100).toFixed(1) 
                  : 0}%
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-indigo-500 transition-shadow hover:shadow-xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Cost/Node</CardTitle>
              <Info className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                ${metrics.totalNodes > 0 ? (metrics.totalCost / metrics.totalNodes).toFixed(6) : "0.000000"}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-teal-500 transition-shadow hover:shadow-xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Tokens/Node</CardTitle>
              <Info className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalNodes > 0 ? Math.round(metrics.totalTokens / metrics.totalNodes).toLocaleString() : 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Filter & Pencarian Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari Node Name, Type, atau Model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={executionIdFilter} onValueChange={setExecutionIdFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter Execution ID" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Execution ID</SelectItem>
                {uniqueExecutionIds.map(execId => (
                  <SelectItem key={execId} value={execId}>{execId}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Node Executions ({totalCount})</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Menampilkan {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} dari {totalCount} data
            </p>
          </div>
          <div>
            <Button className="mr-2" onClick={handleRefresh} variant="outline" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={handleDownloadReport}
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              disabled={totalCount === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto shadow-inner bg-white">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-100 z-10 border-b">
                <TableRow>
                  <TableHead className="w-[100px]">Execution ID</TableHead>
                  <TableHead>Node Name</TableHead>
                  <TableHead>Exec Index</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Start Run</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: itemsPerPage }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : nodeExecutions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      Tidak ada data log yang cocok dengan filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  nodeExecutions.map((node) => (
                    <TableRow 
                      key={node.id} 
                      className="cursor-pointer hover:bg-blue-50/50 transition-colors"
                      onClick={() => handleRowClick(node)}
                    >
                      <TableCell className="font-mono text-xs max-w-[100px] truncate">
                        {node.execution_id}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{node.node_name}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{(node.execution_index ?? 0) + 1}</TableCell>
                      <TableCell className="text-xs">{node.model_name || "-"}</TableCell>
                      <TableCell>{getStatusBadge(node.execution_status)}</TableCell>
                      <TableCell className="text-sm">{formatExecutionTime(node.execution_time_ms)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {node.total_tokens.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-green-700">
                        ${Number(node.estimated_cost_usd).toFixed(6)}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {node.start_time ? new Date(node.start_time).toLocaleDateString('id-ID') : 'N/A'}
                      </TableCell>
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
                  disabled={currentPage === 1 || isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                  disabled={currentPage === totalPages || isLoading}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Detail Node Execution</DialogTitle>
            <DialogDescription>Informasi lengkap dari node execution yang dipilih</DialogDescription>
          </DialogHeader>
          
          {selectedNode && (
            <div className="space-y-5 p-2 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                <DetailItem title="Node Name" value={<span className="font-semibold text-lg text-indigo-700">{selectedNode.node_name}</span>} />
                <DetailItem title="Node Type" value={<Badge variant="outline" className="text-sm">{selectedNode.node_type || "N/A"}</Badge>} />
                <DetailItem title="Status" value={getStatusBadge(selectedNode.execution_status)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-4">
                <DetailItem title="Execution Time" value={<span className="text-lg font-mono text-blue-600">{formatExecutionTime(selectedNode.execution_time_ms)}</span>} />
                <DetailItem title="Cost (USD)" value={<span className="text-lg font-mono text-green-700">${Number(selectedNode.estimated_cost_usd).toFixed(6)}</span>} />
                <DetailItem title="Total Tokens" value={<span className="text-lg font-mono text-orange-600">{selectedNode.total_tokens.toLocaleString()}</span>} />
                <DetailItem title="Finish Reason" value={<span className="text-sm">{selectedNode.finish_reason || "N/A"}</span>} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-4">
                <DetailItem title="Prompt Tokens" value={<span className="font-mono">{selectedNode.prompt_tokens.toLocaleString()}</span>} />
                <DetailItem title="Completion Tokens" value={<span className="font-mono">{selectedNode.completion_tokens.toLocaleString()}</span>} />
                <DetailItem title="Estimated Tokens" value={<span className="font-mono">{selectedNode.estimated_tokens?.toLocaleString() || "N/A"}</span>} />
                <DetailItem title="Accuracy" value={<span className="font-mono">{selectedNode.token_estimation_accuracy ? `${(selectedNode.token_estimation_accuracy * 100).toFixed(1)}%` : "N/A"}</span>} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                <DetailItem title="Model Name" value={<span className="font-semibold">{selectedNode.model_name || "N/A"}</span>} />
                <DetailItem title="Input Items" value={<span className="font-mono">{selectedNode.input_items_count}</span>} />
                <DetailItem title="Output Items" value={<span className="font-mono">{selectedNode.output_items_count}</span>} />
              </div>

              <div className="space-y-2 border-b pb-4">
                <DetailItem title="Execution ID" value={<p className="text-xs font-mono bg-gray-200 p-2 rounded truncate select-all">{selectedNode.execution_id}</p>} />
                <DetailItem title="Node ID" value={<p className="text-xs font-mono bg-gray-200 p-2 rounded truncate select-all">{selectedNode.node_id || "N/A"}</p>} />
                <DetailItem title="UUID" value={<p className="text-xs font-mono bg-gray-200 p-2 rounded truncate select-all">{selectedNode.id}</p>} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                <DetailItem title="Execution Index" value={<span className="font-mono">{selectedNode.execution_index ?? "N/A"}</span>} />
                <DetailItem title="Sub Run Index" value={<span className="font-mono">{selectedNode.sub_run_index ?? "N/A"}</span>} />
                <DetailItem title="Parent Node" value={<span className="text-sm">{selectedNode.parent_node_name || "None"}</span>} />
              </div>

              {selectedNode.output_summary && (
                <div className="border-b pb-4">
                  <DetailItem 
                    title="Output Summary" 
                    value={<p className="text-sm bg-blue-50 p-3 rounded border border-blue-200">{selectedNode.output_summary}</p>} 
                  />
                </div>
              )}

              {selectedNode.has_error && (
                <Alert variant="destructive" className="border-red-500 bg-red-50/50">
                  <AlertCircle className="h-4 w-4 text-red-700" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-bold text-red-700">Error Name: {selectedNode.error_name || "Unknown"}</p>
                      {selectedNode.error_message && (
                        <>
                          <p className="font-semibold text-red-700">Message:</p>
                          <pre className="text-sm bg-red-100 p-3 rounded whitespace-pre-wrap break-all border border-red-300 text-red-800">
                            {selectedNode.error_message}
                          </pre>
                        </>
                      )}
                      {selectedNode.error_stack && (
                        <>
                          <p className="font-semibold text-red-700 mt-2">Stack Trace:</p>
                          <pre className="text-xs bg-red-100 p-3 rounded whitespace-pre-wrap break-all border border-red-300 text-red-800 max-h-40 overflow-y-auto">
                            {selectedNode.error_stack}
                          </pre>
                        </>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem 
                  title="Start Time" 
                  value={
                    <span className="text-sm">
                      {selectedNode.start_time 
                        ? new Date(selectedNode.start_time).toLocaleString('id-ID')
                        : "N/A"}
                    </span>
                  } 
                />
                <DetailItem 
                  title="Inserted At" 
                  value={
                    <span className="text-sm">
                      {new Date(selectedNode.inserted_at).toLocaleString('id-ID')}
                    </span>
                  } 
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DetailItem = ({ title, value }: { title: string, value: React.ReactNode }) => (
    <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {value}
    </div>
);

export default DetailExecution;
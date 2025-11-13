import React, { useEffect, useState, useRef } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
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
import { 
  Workflow, 
  CheckCircle2, 
  Clock, 
  Search, 
  Loader2, 
  Download, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  GitBranch,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

// Interface untuk Workflow Information
interface WorkflowInfo {
  workflow_id: string;
  name: string;
  active_status: boolean;
  created_at: string;
  updated_at: string | null;
  is_archived: boolean;
  time_saved_per_execution: number;
  total_nodes: number;
  error_workflow_call: string | null;
  inserted_at: string;
}

interface RawWorkflowInfo {
  workflow_id: string;
  name: string;
  active_status: boolean;
  created_at: string;
  updated_at: string | null;
  is_archived: boolean;
  time_saved_per_execution: number;
  total_nodes: number;
  error_workflow_call: string | null;
  inserted_at: string;
}

// Interface KPI
interface KPIData {
  totalWorkflows: number;
  activeWorkflows: number;
  totalTimeSaved: number;
}

const WorkflowInformation = () => {
  const [workflows, setWorkflows] = useState<WorkflowInfo[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [kpiData, setKpiData] = useState<KPIData>({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalTimeSaved: 0,
  });
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        setDebouncedSearchTerm(searchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const createBaseQuery = () => {
    return supabase.from("dt_workflow_information" as any);
  };

  const applyCommonFilters = (query: any) => {
    // Filter pencarian
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 3) {
      const searchFilter = `name.ilike.%${debouncedSearchTerm}%,workflow_id.ilike.%${debouncedSearchTerm}%`;
      query = query.or(searchFilter);
    }
    
    // Filter status aktif/non-aktif
    if (statusFilter === "active") {
      query = query.eq("active_status", true);
    } else if (statusFilter === "inactive") {
      query = query.eq("active_status", false);
    }
    
    // Filter archived - hanya tampilkan yang tidak diarsipkan
    query = query.eq("is_archived", false);
    
    // Filter tanggal mulai
    if (startDate) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      query = query.gte("created_at", startDateTime.toISOString());
    }
    
    // Filter tanggal akhir
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte("created_at", endDateTime.toISOString());
    }
    
    return query;
  };

  // Fetch KPI data
  const fetchKPIData = async () => {
    try {
      let query = createBaseQuery()
        .select("*", { count: 'exact', head: false })
        .eq("is_archived", false);
      
      query = applyCommonFilters(query);
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching KPI:", error);
        return;
      }

      const rawData = (data as unknown) as RawWorkflowInfo[] | null;
      const safeData = rawData || [];

      const activeCount = safeData.filter(w => w.active_status).length;
      const totalTimeSaved = safeData.reduce((sum, w) => sum + (w.time_saved_per_execution || 0), 0);

      setKpiData({
        totalWorkflows: safeData.length,
        activeWorkflows: activeCount,
        totalTimeSaved: totalTimeSaved,
      });
    } catch (error) {
      console.error("Error in fetchKPIData:", error);
      toast.error("Gagal memuat data statistik KPI");
    }
  };

  // Fetch paginated data dengan filter
  const fetchData = async () => {
    setIsLoading(true);

    try {
      let query = createBaseQuery()
        .select("*", { count: 'exact' })
        .eq("is_archived", false);

      query = applyCommonFilters(query);

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      query = query
        .order("created_at", { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching workflows:", error);
        toast.error("Gagal memuat data workflow");
        setIsLoading(false);
        return;
      }

      const unknownData = data as unknown;
      const rawData = unknownData as RawWorkflowInfo[] | null; 
      const safeRawData = rawData || [];

      const processedData: WorkflowInfo[] = safeRawData.map((w) => ({
        workflow_id: w.workflow_id,
        name: w.name,
        active_status: w.active_status,
        created_at: w.created_at,
        updated_at: w.updated_at,
        is_archived: w.is_archived,
        time_saved_per_execution: w.time_saved_per_execution || 0,
        total_nodes: w.total_nodes || 0,
        error_workflow_call: w.error_workflow_call,
        inserted_at: w.inserted_at,
      }));
      
      setWorkflows(processedData);
      setTotalCount(count || 0);

      await fetchKPIData();
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error in fetchData:", error);
      toast.error("Terjadi kesalahan saat memuat data");
      setIsLoading(false);
    }
  };

  // Fetch data saat component mount atau filter/pagination berubah
  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, debouncedSearchTerm, statusFilter, startDate, endDate]);

  // Reset ke halaman 1 saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, startDate, endDate]);

  const getStatusBadge = (active: boolean) => {
    return (
      <Badge 
        variant={active ? "default" : "secondary"} 
        className={active ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-400 text-white hover:bg-gray-500"}
      >
        {active ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const formatTime = (minutes: number) => {
    if (minutes === 0) return "0 menit";
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours} jam`);
    if (mins > 0 || parts.length === 0) parts.push(`${mins} menit`);
    
    return parts.join(' ');
  };

  const handleRowClick = (workflow: WorkflowInfo) => {
    setSelectedWorkflow(workflow);
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

  // Download Report Function (CSV)
  const handleDownloadReport = async () => {
    try {
      toast.info("Mengunduh report...");
      
      let exportQuery = createBaseQuery()
        .select("*")
        .eq("is_archived", false);

      exportQuery = applyCommonFilters(exportQuery);
      exportQuery = exportQuery.order("created_at", { ascending: false });

      const { data, error } = await exportQuery;

      if (error) {
        console.error("Error fetching export data:", error);
        toast.error("Gagal mengunduh report");
        return;
      }

      const rawData = (data as unknown) as RawWorkflowInfo[] | null;
      const safeData = rawData || [];

      // Create CSV content
      const headers = [
        "Workflow ID",
        "Name",
        "Status",
        "Total Nodes",
        "Time Saved (minutes)",
        "Error Workflow Call",
        "Created At",
        "Updated At"
      ];

      const csvRows = [
        headers.join(","),
        ...safeData.map(w => [
          `"${w.workflow_id}"`,
          `"${w.name}"`,
          w.active_status ? "Active" : "Inactive",
          w.total_nodes,
          w.time_saved_per_execution, // dalam menit
          `"${w.error_workflow_call || '-'}"`,
          format(new Date(w.created_at), "yyyy-MM-dd HH:mm:ss"),
          w.updated_at ? format(new Date(w.updated_at), "yyyy-MM-dd HH:mm:ss") : "-"
        ].join(","))
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `workflow_information_${format(new Date(), "yyyy-MM-dd_HHmmss")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Report berhasil diunduh!");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Terjadi kesalahan saat mengunduh report");
    }
  };

  // Komponen untuk Detail Modal
  const WorkflowDetailContent = ({ workflow }: { workflow: WorkflowInfo | null }) => {
    if (!workflow) return null;

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Workflow Name</p>
              <p className="text-base font-semibold">{workflow.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="mt-1">{getStatusBadge(workflow.active_status)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Nodes</p>
              <p className="text-base font-mono">{workflow.total_nodes}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Time Saved per Execution</p>
              <p className="text-base">{formatTime(workflow.time_saved_per_execution)} per eksekusi</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Workflow ID</p>
            <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{workflow.workflow_id}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created At</p>
              <p className="text-sm">{format(new Date(workflow.created_at), "dd MMMM yyyy, HH:mm:ss", { locale: id })}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Updated At</p>
              <p className="text-sm">
                {workflow.updated_at 
                  ? format(new Date(workflow.updated_at), "dd MMMM yyyy, HH:mm:ss", { locale: id })
                  : "-"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Inserted At (Database)</p>
            <p className="text-sm">{format(new Date(workflow.inserted_at), "dd MMMM yyyy, HH:mm:ss", { locale: id })}</p>
          </div>

          {workflow.error_workflow_call && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-1">Error Workflow Call</p>
                <p className="text-sm">{workflow.error_workflow_call}</p>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  };
  
  if (isLoading && workflows.length === 0) {
    return (
      <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Metrics Cards Skeleton - 3 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg border-l-4 border-gray-300 p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>

          {/* Filter Card Skeleton */}
          <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Skeleton */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <Skeleton className="h-6 w-56 mb-2" />
                <Skeleton className="h-4 w-72" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-40" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto shadow-inner bg-white">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      {[...Array(6)].map((_, i) => (
                        <TableHead key={i}>
                          <Skeleton className="h-4 w-full" />
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(10)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(6)].map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Skeleton */}
              <div className="flex items-center justify-between mt-4 px-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-9 w-20" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-10" />
                  <Skeleton className="h-9 w-10" />
                  <Skeleton className="h-9 w-10" />
                  <Skeleton className="h-9 w-24" />
                </div>
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workflow Information</h2>
          <p className="text-muted-foreground">Kelola dan monitor informasi workflow</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatedMetricCard
            title="Total Workflow"
            value={kpiData.totalWorkflows}
            suffix=""
            icon={<Workflow className="h-5 w-5 text-blue-500" />}
            borderColor="border-blue-500"
            subtitle="Total workflow terdaftar"
            decimals={0}
          />
          
          <AnimatedMetricCard
            title="Workflow Aktif"
            value={kpiData.activeWorkflows}
            suffix=""
            icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
            borderColor="border-green-600"
            subtitle={kpiData.totalWorkflows > 0
              ? `${((kpiData.activeWorkflows / kpiData.totalWorkflows) * 100).toFixed(1)}% dari total`
              : "Tidak ada data"}
            decimals={0}
          />

          <AnimatedMetricCard
            title="Estimasi Penghematan Waktu"
            value={kpiData.totalTimeSaved}
            suffix=" menit"
            icon={<Clock className="h-5 w-5 text-orange-500" />}
            borderColor="border-orange-500"
            subtitle="Total per-eksekusi"
            decimals={0}
            useLocaleString={true}
          />
        </div>

        {/* Filters */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari Workflow Name / ID (min 3 kar)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchTerm.length > 0 && searchTerm.length < 3 && (
                  <p className="text-xs text-amber-600 mt-1">Minimal 3 karakter untuk pencarian</p>
                )}
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-4">
                <Input
                  type="date"
                  placeholder="Tanggal Mulai"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-7"
                />

                <Input
                  type="date"
                  placeholder="Tanggal Akhir"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>

            {(startDate || endDate) && (
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Periode: {startDate || 'Awal'} - {endDate || 'Sekarang'}
                </Badge>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="h-6 text-xs"
                >
                  Reset Periode
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Daftar Workflow ({totalCount})</CardTitle>
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
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Workflow Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time Saved</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : workflows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {searchTerm || statusFilter !== "all"
                          ? "Tidak ada data yang sesuai dengan filter" 
                          : "Belum ada data workflow"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    workflows.map((workflow) => (
                      <TableRow 
                        key={workflow.workflow_id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(workflow)}
                      >
                        <TableCell>{workflow.workflow_id}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-muted-foreground" />
                            {workflow.name}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(workflow.active_status)}</TableCell>
                        <TableCell>{formatTime(workflow.time_saved_per_execution)}</TableCell>
                        <TableCell>
                          {format(new Date(workflow.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                        </TableCell>
                        <TableCell>
                          {workflow.updated_at 
                            ? format(new Date(workflow.updated_at), "dd MMM yyyy, HH:mm", { locale: id })
                            : "-"}
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Workflow Information</DialogTitle>
              <DialogDescription>
                Informasi lengkap dari workflow yang dipilih.
              </DialogDescription>
            </DialogHeader>
            
            <WorkflowDetailContent workflow={selectedWorkflow} />

          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Custom Hook untuk animasi counter
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

// Komponen Animated Metric Card
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

export default WorkflowInformation;
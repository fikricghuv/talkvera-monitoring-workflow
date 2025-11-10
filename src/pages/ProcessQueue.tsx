import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, AlertTriangle, CheckCircle, RefreshCw, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

interface QueueItem {
  id: string;
  execution_id: string;
  workflow_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface RawQueueData {
  id: string;
  execution_id: string;
  workflow_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface QueueKPI {
  newQueue: number;
  processed: number;
  failed: number;
}

const ProcessQueue = () => {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [kpiData, setKpiData] = useState<QueueKPI>({
    newQueue: 0,
    processed: 0,
    failed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch KPI data (untuk card statistics)
  const fetchKPIData = async () => {
    try {
      // Fetch counts for each status
      const { count: pendingCount } = await supabase
        .from("dt_execution_process_queue")
        .select("*", { count: 'exact', head: true })
        .eq("status", "pending");

      const { count: doneCount } = await supabase
        .from("dt_execution_process_queue")
        .select("*", { count: 'exact', head: true })
        .eq("status", "done");

      const { count: failedCount } = await supabase
        .from("dt_execution_process_queue")
        .select("*", { count: 'exact', head: true })
        .eq("status", "failed");

      setKpiData({
        newQueue: pendingCount || 0,
        processed: doneCount || 0,
        failed: failedCount || 0,
      });
    } catch (error) {
      console.error("Error fetching KPI:", error);
    }
  };

  // Fetch paginated data dengan filter
  const fetchData = async () => {
    setIsLoading(true);

    try {
      // Build query dengan filter
      let query = supabase
        .from("dt_execution_process_queue")
        .select("*", { count: 'exact' });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`execution_id.ilike.%${searchTerm}%,workflow_id.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`);
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

        // Custom end date filter
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
        console.error("Error fetching queue:", error);
        toast.error("Gagal memuat data antrian");
        setIsLoading(false);
        return;
      }

      const unknownData = data as unknown;
      const rawData = unknownData as RawQueueData[] | null;
      const safeRawData = rawData || [];

      const processedData: QueueItem[] = safeRawData.map((item) => ({
        id: item.id,
        execution_id: item.execution_id,
        workflow_id: item.workflow_id,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setQueueItems(processedData);
      setTotalCount(count || 0);
      
      // Fetch KPI data secara terpisah
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
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, periodFilter, customStartDate, customEndDate]);

  // Reset ke halaman 1 saat filter berubah (kecuali pagination)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, periodFilter, customStartDate, customEndDate]);

  const handleRefresh = () => {
    toast.info("Memuat ulang data...");
    fetchData();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: "default" | "destructive" | "secondary" | "outline"; className: string }
    > = {
      pending: { variant: "secondary", className: "bg-yellow-500 text-white hover:bg-yellow-600" },
      processing: { variant: "default", className: "bg-blue-500 text-white hover:bg-blue-600" },
      done: { variant: "default", className: "bg-green-500 text-white hover:bg-green-600" },
      failed: { variant: "destructive", className: "" },
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleRowClick = (item: QueueItem) => {
    setSelectedQueueItem(item);
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

  if (isLoading && queueItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pl-4 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Process Queue</h2>
          <p className="text-muted-foreground">Monitor antrian proses workflow eksekusi</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-lg border-l-4 border-yellow-500 transition-shadow hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Antrian Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.newQueue}</div>
            <p className="text-xs text-muted-foreground">Menunggu diproses</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-green-600 transition-shadow hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai Diproses</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.processed}</div>
            <p className="text-xs text-muted-foreground">Status Done</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-red-500 transition-shadow hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gagal Diproses</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.failed}</div>
            <p className="text-xs text-muted-foreground">Perlu perhatian</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari execution ID atau workflow..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
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

      {/* Queue Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Antrian ({totalCount})</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Menampilkan {totalCount > 0 ? startIndex + 1 : 0}-{endIndex} dari {totalCount} data
            </p>
          </div>
          <div>
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium">Execution ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Workflow</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Dibuat</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Diupdate</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : queueItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      {searchTerm || statusFilter !== "all" || periodFilter !== "all"
                        ? "Tidak ada data yang sesuai dengan filter"
                        : "Tidak ada item dalam antrian"}
                    </td>
                  </tr>
                ) : (
                  queueItems.map((item) => (
                    <tr 
                      key={item.id}
                      className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRowClick(item)}
                    >
                      <td className="px-4 py-3 font-mono text-xs">
                        {item.execution_id}
                      </td>
                      <td className="px-4 py-3 font-medium">{item.workflow_id}</td>
                      <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                      <td className="px-4 py-3 text-sm">
                        {format(new Date(item.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {format(new Date(item.updated_at), "dd MMM yyyy, HH:mm", { locale: id })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Queue Item</DialogTitle>
            <DialogDescription>Informasi lengkap dari item antrian</DialogDescription>
          </DialogHeader>
          
          {selectedQueueItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Workflow</p>
                  <p className="text-base font-semibold">{selectedQueueItem.workflow_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedQueueItem.status)}</div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Queue ID</p>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{selectedQueueItem.id}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Execution ID</p>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{selectedQueueItem.execution_id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dibuat Pada</p>
                  <p className="text-sm">{format(new Date(selectedQueueItem.created_at), "dd MMMM yyyy, HH:mm:ss", { locale: id })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Diupdate Pada</p>
                  <p className="text-sm">{format(new Date(selectedQueueItem.updated_at), "dd MMMM yyyy, HH:mm:ss", { locale: id })}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProcessQueue;
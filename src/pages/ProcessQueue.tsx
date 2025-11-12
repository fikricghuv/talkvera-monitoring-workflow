import { useEffect, useState, useRef } from "react";
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
import { Clock, AlertTriangle, CheckCircle, RefreshCw, Search, Loader2, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// --- Tipe Data ---
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

// --- Komponen Utama ---
const ProcessQueue = () => {
  // --- State ---
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [kpiData, setKpiData] = useState<QueueKPI>({
    newQueue: 0,
    processed: 0,
    failed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // State untuk Modal
  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Effects ---

  // Debounce untuk input pencarian
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        setDebouncedSearchTerm(searchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data utama saat filter atau halaman berubah
  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, debouncedSearchTerm, statusFilter, startDate, endDate]);

  // Reset ke halaman 1 jika ada filter yang berubah (selain pagination)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, startDate, endDate]);

  // --- Helper Functions ---
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const formatDateLong = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(date);
  };

  // --- Logika Fetch Data (DIPERBAIKI) ---

  // Helper untuk membuat base query dengan filter umum
  const createBaseQuery = () => {
    let query = supabase.from("dt_execution_process_queue");
    
    return query;
  };

  // Apply common filters ke query
  const applyCommonFilters = (query: any) => {
    // Terapkan filter pencarian
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 3) {
      const searchFilter = `execution_id.ilike.%${debouncedSearchTerm}%,workflow_id.ilike.%${debouncedSearchTerm}%`;
      query = query.or(searchFilter);
    }
    
    // Terapkan filter periode (startDate)
    if (startDate) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      query = query.gte("created_at", startDateTime.toISOString());
    }
    
    // Terapkan filter periode (endDate)
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte("created_at", endDateTime.toISOString());
    }
    
    return query;
  };

  // Fetch KPI data (DIPERBAIKI - sekarang konsisten dengan filter)
  const fetchKPIData = async () => {
    try {
      // Jika ada filter status spesifik, hitung hanya status tersebut
      if (statusFilter !== "all") {
        let query = createBaseQuery()
          .select("id", { count: 'exact', head: true })
          .eq("status", statusFilter);
        
        // Apply common filters (search, date range)
        query = applyCommonFilters(query);
        
        const result = await query;
        
        // Set KPI sesuai status yang dipilih
        const count = result.count || 0;
        setKpiData({
          newQueue: statusFilter === "pending" ? count : 0,
          processed: statusFilter === "done" ? count : 0,
          failed: statusFilter === "failed" ? count : 0,
        });
      } else {
        // Jika "all", hitung semua status secara paralel
        const createStatusQuery = (status: string) => {
          let query = createBaseQuery()
            .select("id", { count: 'exact', head: true })
            .eq("status", status);
          
          // Apply common filters
          query = applyCommonFilters(query);
          
          return query;
        };

        const [pendingResult, doneResult, failedResult] = await Promise.all([
          createStatusQuery("pending"),
          createStatusQuery("done"),
          createStatusQuery("failed")
        ]);

        setKpiData({
          newQueue: pendingResult.count || 0,
          processed: doneResult.count || 0,
          failed: failedResult.count || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching KPI:", error);
      toast.error("Gagal memuat data statistik KPI");
    }
  };

  // Fetch data utama untuk tabel (DIPERBAIKI)
  const fetchData = async () => {
    setIsLoading(true);

    try {
      // 1. Buat query dasar
      let query = createBaseQuery()
        .select("*", { count: 'exact' });

      // 2. Apply common filters (search, date range)
      query = applyCommonFilters(query);

      // 3. Terapkan filter status (jika bukan "all")
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      // 4. Terapkan pagination & sorting
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      query = query
        .order("created_at", { ascending: false })
        .range(from, to);

      // 5. Eksekusi query
      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching queue:", error);
        toast.error("Gagal memuat data antrian");
        setIsLoading(false);
        return;
      }

      // 6. Proses data
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
      
      // 7. Fetch KPI secara paralel
      await fetchKPIData();
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error in fetchData:", error);
      toast.error("Terjadi kesalahan saat memuat data");
      setIsLoading(false);
    }
  };

  // --- Event Handlers ---

  const handleRefresh = () => {
    toast.info("Memuat ulang data...");
    fetchData();
  };

  // Badge status
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

  // Modal
  const handleRowClick = (item: QueueItem) => {
    setSelectedQueueItem(item);
    setIsModalOpen(true);
  };

  // Pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // --- Render ---

  if (isLoading && currentPage === 1) {
    return (
      <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Metrics Cards Skeleton - 4 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
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
                      {[...Array(9)].map((_, i) => (
                        <TableHead key={i}>
                          <Skeleton className="h-4 w-full" />
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(10)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(9)].map((_, j) => (
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Process Queue</h2>
            <p className="text-muted-foreground">Monitor antrian proses workflow eksekusi</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <AnimatedMetricCard
            title="Antrian Pending"
            value={kpiData.newQueue}
            suffix=""
            icon={<Clock className="h-5 w-5 text-yellow-500" />}
            borderColor="border-yellow-500"
            subtitle="Menunggu diproses"
            decimals={0}
          />

          <AnimatedMetricCard
            title="Selesai Diproses"
            value={kpiData.processed}
            suffix=""
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            borderColor="border-green-600"
            subtitle="Status Done"
            decimals={0}
          />

          <AnimatedMetricCard
            title="Gagal Diproses"
            value={kpiData.failed}
            suffix=""
            icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
            borderColor="border-red-500"
            subtitle="Perlu perhatian"
            decimals={0}
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
                  placeholder="Cari Exec ID / Workflow (min 3 kar)..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
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

        {/* Queue Table */}
        <Card className="shadow-lg">
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
                        {debouncedSearchTerm || statusFilter !== "all" || startDate || endDate
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
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {formatDate(item.updated_at)}
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
                  <p className="text-sm font-medium text-muted-foreground">Execution ID</p>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{selectedQueueItem.execution_id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dibuat Pada</p>
                    <p className="text-sm">{formatDateLong(selectedQueueItem.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Diupdate Pada</p>
                    <p className="text-sm">{formatDateLong(selectedQueueItem.updated_at)}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

const useCountUp = (end: number, duration = 2000, decimals = 0, prefix = '', suffix = '', useLocaleString = false) => {
  const [displayValue, setDisplayValue] = useState('0');
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const endValue = parseFloat(String(end)) || 0;
    startTimeRef.current = null;
    countRef.current = 0;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      
      const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      const currentCount = endValue * easeOut;
      countRef.current = currentCount;

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
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  borderColor: string;
  subtitle: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  useLocaleString?: boolean;
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

export default ProcessQueue;
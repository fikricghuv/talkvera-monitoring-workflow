import { useState, useEffect } from "react";
import { toast } from "sonner";
import { QueueItem } from "@/types/processQueue";
import { useProcessQueue } from "@/hooks/useProcessQueue";
import { QueueSkeleton } from "@/components/queueExecution/QueueSkeleton";
import { QueueHeader } from "@/components/queueExecution/QueueHeader";
import { QueueMetrics } from "@/components/queueExecution/QueueMetrics";
import { QueueFilters } from "@/components/queueExecution/QueueFilters";
import { QueueTable } from "@/components/queueExecution/QueueTable"; 
import { QueueDetailModal } from "@/components/queueExecution/QueueDetailModal";

const ProcessQueue = () => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Modal State
  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Local Loading State untuk Webhook
  const [isProcessing, setIsProcessing] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        setDebouncedSearchTerm(searchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, startDate, endDate]);

  // Custom hook for fetching data
  const {
    queueItems,
    kpiData,
    isLoading,
    totalCount,
    refetch
  } = useProcessQueue(
    { searchTerm, debouncedSearchTerm, statusFilter, startDate, endDate },
    currentPage,
    itemsPerPage
  );

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
    refetch();
  };

  const handleProcessPending = async () => {
    // Prevent double click
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      
      // URL Webhook n8n
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL_PROCES_QUEUE;
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // ⚠️ PENTING: Ganti 'Nama-Header-Auth' dan 'Value-Nya' sesuai 
          // dengan yang ada di Credential n8n kamu ("Header Auth landing-page")
          // Contoh: "Authorization": "Bearer rahasia123" atau "x-api-key": "12345"
          "x-api-key": "landing-page" 
        },
        body: JSON.stringify({
          action: "process_pending_queue",
          triggered_at: new Date().toISOString(),
          user_trigger: "admin_dashboard" 
        })
      });

      if (response.ok) {
        toast.success("Permintaan anda sedang diproses!");
        // Tunggu sebentar sebelum refresh agar n8n sempat memproses status awal jika cepat
        setTimeout(() => {
            refetch();
        }, 1000);
      } else {
        console.error("Webhook Error:", response.status, response.statusText);
        toast.error(`Gagal trigger webhook: ${response.status}`);
      }
    } catch (error) {
      console.error("Error hitting webhook:", error);
      toast.error("Terjadi kesalahan koneksi ke server");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRowClick = (item: QueueItem) => {
    setSelectedQueueItem(item);
    setIsModalOpen(true);
  };

  // Show skeleton only on initial load
  if (isLoading && currentPage === 1 && !isProcessing) {
    return <QueueSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <QueueHeader />

        <QueueMetrics kpiData={kpiData} />

        <QueueFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        {/* QueueTable dengan Pagination di dalamnya */}
        <QueueTable
          queueItems={queueItems}
          isLoading={isLoading || isProcessing} 
          totalCount={totalCount}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          debouncedSearchTerm={debouncedSearchTerm}
          statusFilter={statusFilter}
          startDate={startDate}
          endDate={endDate}
          
          // 👇 Menggunakan 'newQueue' karena di useProcessQueue.ts key-nya adalah 'newQueue'
          pendingCount={kpiData?.newQueue || 0}
          
          onRefresh={handleRefresh}
          onProcess={handleProcessPending}
          onRowClick={handleRowClick}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />

        <QueueDetailModal
          isOpen={isModalOpen}
          onClose={setIsModalOpen}
          queueItem={selectedQueueItem}
        />
      </div>
    </div>
  );
};

export default ProcessQueue;
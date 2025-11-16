import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Appointment } from "@/types/appointments";
import { useAppointments } from "@/hooks/useAppointments";
import { AppointmentSkeleton } from "@/components/klinikGriyaSehat/appointment/AppointmentSkeleton";
import { AppointmentHeader } from "@/components/klinikGriyaSehat/appointment/AppointmentHeader";
import { AppointmentMetrics } from "@/components/klinikGriyaSehat/appointment/AppointmentMetrics";
import { AppointmentFilters } from "@/components/klinikGriyaSehat/appointment/AppointmentFilters";
import { AppointmentTable } from "@/components/klinikGriyaSehat/appointment/AppointmentTable";
import { PaginationControls } from "@/components/PaginationControls";
import { AppointmentDetailModal } from "@/components/klinikGriyaSehat/appointment/AppointmentDetailModal";

const AppointmentManagement = () => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Modal State
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    appointments,
    metrics,
    isLoading,
    totalCount,
    uniqueStatuses,
    refetch,
    updateAppointmentStatus
  } = useAppointments(
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

  const handleRowClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    updateAppointmentStatus(id, newStatus);
  };

  if (isLoading && currentPage === 1) {
    return <AppointmentSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <AppointmentHeader />

        <AppointmentMetrics metrics={metrics} />

        <AppointmentFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          uniqueStatuses={uniqueStatuses}
        />

        <AppointmentTable
          appointments={appointments}
          isLoading={isLoading}
          totalCount={totalCount}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onRefresh={handleRefresh}
          onRowClick={handleRowClick}
          onUpdateStatus={handleUpdateStatus}
        />

        {totalCount > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}

        <AppointmentDetailModal
          isOpen={isModalOpen}
          onClose={setIsModalOpen}
          appointment={selectedAppointment}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  );
};

export default AppointmentManagement;
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Appointment } from "@/types/appointmentsTalkvera";
import { useAppointments } from "@/hooks/useAppointmentsTalkvera";
import { AppointmentSkeleton } from "@/components/operasionalBisnis/appointmentMonitoringTalkvera/AppointmentSkeleton";
import { AppointmentHeader } from "@/components/operasionalBisnis/appointmentMonitoringTalkvera/AppointmentHeader";
import { AppointmentMetrics } from "@/components/operasionalBisnis/appointmentMonitoringTalkvera/AppointmentMetrics";
import { AppointmentFilters } from "@/components/operasionalBisnis/appointmentMonitoringTalkvera/AppointmentFilters";
import { AppointmentTable } from "@/components/operasionalBisnis/appointmentMonitoringTalkvera/AppointmentTable";
import { AppointmentDetailModal } from "@/components/operasionalBisnis/appointmentMonitoringTalkvera/AppointmentDetailModal";
import { AppointmentFormModal } from "@/components/operasionalBisnis/appointmentMonitoringTalkvera/AppointmentFormModal";

const AppointmentManagementCRM = () => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Modal States
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

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
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment
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
    setIsDetailModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedAppointment(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    if (formMode === 'create') {
      return await createAppointment(formData);
    } else {
      return await updateAppointment(selectedAppointment!.id, formData);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteAppointment(id);
  };

  if (isLoading && currentPage === 1) {
    return <AppointmentSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <AppointmentHeader />
          <Button 
            onClick={handleCreateNew}
            className="bg-green-600 hover:bg-green-700 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Buat Appointment
          </Button>
        </div>

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
          totalPages={totalPages}
          onRefresh={handleRefresh}
          onRowClick={handleRowClick}
          onEdit={handleEdit}
          onUpdateStatus={updateAppointmentStatus}
          onDelete={handleDelete}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />

        <AppointmentDetailModal
          isOpen={isDetailModalOpen}
          onClose={setIsDetailModalOpen}
          appointment={selectedAppointment}
          onUpdateStatus={updateAppointmentStatus}
        />

        <AppointmentFormModal
          isOpen={isFormModalOpen}
          onClose={setIsFormModalOpen}
          appointment={selectedAppointment}
          onSubmit={handleFormSubmit}
          mode={formMode}
        />
      </div>
    </div>
  );
};

export default AppointmentManagementCRM;
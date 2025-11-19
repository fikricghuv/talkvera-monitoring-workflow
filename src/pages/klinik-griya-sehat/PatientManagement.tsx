import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Patient } from "@/types/patients";
import { usePatients } from "@/hooks/usePatients";
import { PatientSkeleton } from "@/components/klinikGriyaSehat/patient/PatientSkeleton";
import { PatientHeader } from "@/components/klinikGriyaSehat/patient/PatientHeader";
import { PatientMetrics } from "@/components/klinikGriyaSehat/patient/PatientMetrics";
import { PatientFilters } from "@/components/klinikGriyaSehat/patient/PatientFilters";
import { PatientTable } from "@/components/klinikGriyaSehat/patient/PatientTable";
import { PatientDetailModal } from "@/components/klinikGriyaSehat/patient/PatientDetailModal";

const PatientManagement = () => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Modal State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
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
  }, [debouncedSearchTerm, genderFilter, startDate, endDate]);

  // Custom hook for fetching data
  const {
    patients,
    metrics,
    isLoading,
    totalCount,
    refetch,
    updatePatient
  } = usePatients(
    { searchTerm, debouncedSearchTerm, genderFilter, startDate, endDate },
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

  const handleRowClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleUpdatePatient = (id: string, updates: Partial<Patient>) => {
    updatePatient(id, updates);
  };

  if (isLoading && currentPage === 1) {
    return <PatientSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <PatientHeader />

        <PatientMetrics metrics={metrics} />

        <PatientFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          genderFilter={genderFilter}
          setGenderFilter={setGenderFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        <PatientTable
          patients={patients}
          isLoading={isLoading}
          totalCount={totalCount}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          onRefresh={handleRefresh}
          onRowClick={handleRowClick}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />

        <PatientDetailModal
          isOpen={isModalOpen}
          onClose={setIsModalOpen}
          patient={selectedPatient}
          onUpdatePatient={handleUpdatePatient}
        />
      </div>
    </div>
  );
};

export default PatientManagement;
// pages/CRMManagement.tsx

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CRMContact, CRMFormData } from "@/types/crmContacts";
import { useCRMContacts } from "@/hooks/useCRMContacts";
import { CRMSkeleton } from "@/components/operasionalBisnis/crm/CRMSkeleton";
import { CRMHeader } from "@/components/operasionalBisnis/crm/CRMHeader";
import { CRMMetrics } from "@/components/operasionalBisnis/crm/CRMMetrics";
import { CRMFilters } from "@/components/operasionalBisnis/crm/CRMFilters";
import { CRMTable } from "@/components/operasionalBisnis/crm/CRMTable";
import { CRMCreateModal } from "@/components/operasionalBisnis/crm/CRMCreateModal";
import { CRMDetailModal } from "@/components/operasionalBisnis/crm/CRMDetailModal";

const CRMManagement = () => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState<string>("all");
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("all");
  
  // Modal States
  const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
  }, [debouncedSearchTerm, lifecycleFilter, leadStatusFilter]);

  // Custom hook for fetching data
  const {
    contacts,
    metrics,
    isLoading,
    totalCount,
    uniqueLifecycleStages,
    uniqueLeadStatuses,
    refetch,
    createContact,
    updateContact
  } = useCRMContacts(
    { searchTerm, debouncedSearchTerm, lifecycleFilter, leadStatusFilter },
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

  const handleRowClick = (contact: CRMContact) => {
    setSelectedContact(contact);
    setIsDetailModalOpen(true);
  };

  const handleCreateContact = async (formData: CRMFormData) => {
    try {
      await createContact(formData);
      setIsCreateModalOpen(false);
    } catch (error) {
      // Error handling already done in hook
    }
  };

  const handleUpdateStatus = (id: string, updates: Partial<CRMContact>) => {
    updateContact(id, updates);
  };

  if (isLoading && currentPage === 1) {
    return <CRMSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <CRMHeader onCreateClick={() => setIsCreateModalOpen(true)} />

        <CRMMetrics metrics={metrics} />

        <CRMFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          lifecycleFilter={lifecycleFilter}
          setLifecycleFilter={setLifecycleFilter}
          leadStatusFilter={leadStatusFilter}
          setLeadStatusFilter={setLeadStatusFilter}
          uniqueLifecycleStages={uniqueLifecycleStages}
          uniqueLeadStatuses={uniqueLeadStatuses}
        />

        <CRMTable
          contacts={contacts}
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

        <CRMCreateModal
          isOpen={isCreateModalOpen}
          onClose={setIsCreateModalOpen}
          onSubmit={handleCreateContact}
        />

        <CRMDetailModal
          isOpen={isDetailModalOpen}
          onClose={setIsDetailModalOpen}
          contact={selectedContact}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  );
};

export default CRMManagement;
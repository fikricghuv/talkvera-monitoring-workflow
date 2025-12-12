// components/crm/CRMTable.tsx

import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CRMContact } from "@/types/crmContacts";
import { CRMStatusBadge } from "./CRMStatusBadge";
import { formatDateTime, isCreatedToday } from "@/utils/crmUtils";
import { PaginationControls } from "@/components/PaginationControls";

interface CRMTableProps {
  contacts: CRMContact[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onRefresh: () => void;
  onRowClick: (contact: CRMContact) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
}

export const CRMTable = ({
  contacts,
  isLoading,
  totalCount,
  currentPage,
  itemsPerPage,
  totalPages,
  onRefresh,
  onRowClick,
  onPageChange,
  onItemsPerPageChange
}: CRMTableProps) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daftar Kontak ({totalCount})</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Menampilkan {totalCount > 0 ? startIndex + 1 : 0}-{endIndex} dari {totalCount} data
          </p>
        </div>
        <div>
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50 z-10 border-b">
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perusahaan</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Lifecycle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Created</TableHead>
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
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    Tidak ada data kontak yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow 
                    key={contact.id} 
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                      isCreatedToday(contact.created_at) ? 'bg-green-50' : ''
                    }`}
                    onClick={() => onRowClick(contact)}
                  >
                    <TableCell className="font-medium">
                      {contact.full_name}
                      {isCreatedToday(contact.created_at) && (
                        <span className="ml-2 text-xs text-green-600 font-semibold">
                          New
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {contact.email}
                    </TableCell>
                    <TableCell>
                      {contact.company || '-'}
                    </TableCell>
                    <TableCell>
                      {contact.job_title || '-'}
                    </TableCell>
                    <TableCell>
                      <CRMStatusBadge status={contact.lifecycle_stage} type="lifecycle" />
                    </TableCell>
                    <TableCell>
                      <CRMStatusBadge status={contact.lead_status} type="lead" />
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-semibold">
                        {contact.lead_score}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {contact.first_source}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(contact.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalCount > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            isLoading={isLoading}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        )}
      </CardContent>
    </Card>
  );
};
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Patient } from "@/types/patients";
import { PaginationControls } from "@/components/PaginationControls";

interface PatientTableProps {
  patients: Patient[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onRefresh: () => void;
  onRowClick: (patient: Patient) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
}

export const PatientTable = ({
  patients,
  isLoading,
  totalCount,
  currentPage,
  itemsPerPage,
  totalPages,
  onRefresh,
  onRowClick,
  onPageChange,
  onItemsPerPageChange
}: PatientTableProps) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getGenderBadge = (gender: string | null) => {
    if (!gender) return <Badge variant="outline">-</Badge>;
    
    if (gender.toLowerCase() === 'male') {
      return <Badge className="bg-blue-100 text-blue-800">Laki-laki</Badge>;
    } else if (gender.toLowerCase() === 'female') {
      return <Badge className="bg-pink-100 text-pink-800">Perempuan</Badge>;
    }
    return <Badge variant="outline">{gender}</Badge>;
  };

  const isProfileComplete = (patient: Patient) => {
    return patient.full_name && patient.tanggal_lahir && patient.gender;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daftar Patients ({totalCount})</CardTitle>
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
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Tanggal Lahir</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Status Profil</TableHead>
                <TableHead>Terdaftar</TableHead>
                <TableHead>Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Tidak ada data patient yang cocok dengan filter.
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow 
                    key={patient.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onRowClick(patient)}
                  >
                    <TableCell className="font-medium">
                      {patient.full_name || <span className="text-muted-foreground italic">Belum diisi</span>}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {patient.whatsapp_number}
                    </TableCell>
                    <TableCell>
                      {formatDate(patient.tanggal_lahir)}
                    </TableCell>
                    <TableCell>
                      {getGenderBadge(patient.gender)}
                    </TableCell>
                    <TableCell>
                      {isProfileComplete(patient) ? (
                        <Badge className="bg-green-100 text-green-800">Lengkap</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800">Belum Lengkap</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(patient.created_at)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(patient.updated_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
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
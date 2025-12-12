import { RefreshCw, Trash2, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Appointment } from "@/types/appointmentsTalkvera";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { formatAppointmentDate, isAppointmentToday, isAppointmentPast } from "@/utils/appointmentTalkveraUtils";
import { PaginationControls } from "@/components/PaginationControls";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface AppointmentTableProps {
  appointments: Appointment[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onRefresh: () => void;
  onRowClick: (appointment: Appointment) => void;
  onEdit: (appointment: Appointment) => void;
  onUpdateStatus: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
}

export const AppointmentTable = ({
  appointments,
  isLoading,
  totalCount,
  currentPage,
  itemsPerPage,
  totalPages,
  onRefresh,
  onRowClick,
  onEdit,
  onUpdateStatus,
  onDelete,
  onPageChange,
  onItemsPerPageChange
}: AppointmentTableProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    onUpdateStatus(appointmentId, newStatus);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Appointments ({totalCount})</CardTitle>
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
                  <TableHead>Client</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telpon</TableHead>
                  <TableHead>Perusahaan</TableHead>
                  <TableHead>Waktu Mulai</TableHead>
                  <TableHead>Waktu Selesai</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: itemsPerPage }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={11}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                      Tidak ada data appointment yang ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((appointment) => (
                    <TableRow 
                      key={appointment.id} 
                      className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                        isAppointmentToday(appointment.appointment_start) 
                          ? 'bg-yellow-50' 
                          : isAppointmentPast(appointment.appointment_start)
                          ? 'opacity-60'
                          : ''
                      }`}
                      onClick={() => onRowClick(appointment)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {appointment.contact_name || 'Tidak ada nama'}
                          </span>
                          {appointment.contact_job_title && (
                            <span className="text-xs text-muted-foreground">
                              {appointment.contact_job_title}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {appointment.contact_email || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {appointment.contact_phone || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {appointment.contact_company || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatAppointmentDate(appointment.appointment_start)}
                          </span>
                          {isAppointmentToday(appointment.appointment_start) && (
                            <span className="text-xs text-yellow-600 font-semibold">
                              Hari ini
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {appointment.appointment_end 
                          ? formatAppointmentDate(appointment.appointment_end)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {appointment.source === 'landing_page' ? 'Landing Page' :
                           appointment.source === 'whatsapp' ? 'WhatsApp' :
                           'Manual'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <AppointmentStatusBadge status={appointment.status} />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(appointment)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteId(appointment.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus appointment ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
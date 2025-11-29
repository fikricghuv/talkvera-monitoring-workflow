import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Appointment } from "@/types/appointmentsTalkvera";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { formatAppointmentDate, isAppointmentToday, isAppointmentPast } from "@/utils/appointmentTalkveraUtils";
import { PaginationControls } from "@/components/PaginationControls";

interface AppointmentTableProps {
  appointments: Appointment[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onRefresh: () => void;
  onRowClick: (appointment: Appointment) => void;
  onUpdateStatus: (id: string, newStatus: string) => void;
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
  onUpdateStatus,
  onPageChange,
  onItemsPerPageChange
}: AppointmentTableProps) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    onUpdateStatus(appointmentId, newStatus);
  };

  return (
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
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Waktu Mulai</TableHead>
                <TableHead>Waktu Selesai</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Update Status</TableHead>
                <TableHead>Google Cal</TableHead>
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
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
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
                      {appointment.full_name}
                    </TableCell>
                    <TableCell className="text-sm">
                      {appointment.email}
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
                    <TableCell className="max-w-[200px] truncate">
                      {appointment.notes || '-'}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {appointment.source}
                      </span>
                    </TableCell>
                    <TableCell>
                      <AppointmentStatusBadge status={appointment.status} />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={appointment.status}
                        onValueChange={(newStatus) => handleStatusChange(appointment.id, newStatus)}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Terjadwal</SelectItem>
                          <SelectItem value="completed">Selesai</SelectItem>
                          <SelectItem value="canceled">Dibatalkan</SelectItem>
                          <SelectItem value="rescheduled">Dijadwal Ulang</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs">
                      {appointment.google_event_id 
                        ? '✓ Synced' 
                        : '-'}
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
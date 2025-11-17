import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Appointment } from "@/types/appointments";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { formatAppointmentDate, isAppointmentToday, isAppointmentPast } from "@/utils/appointmentUtils";
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
                <TableHead>Pasien</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Tanggal & Waktu</TableHead>
                <TableHead>Alasan Kunjungan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Update Status</TableHead>
                <TableHead>Google Cal</TableHead>
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
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Tidak ada data appointment yang cocok dengan filter.
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => (
                  <TableRow 
                    key={appointment.id} 
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                      isAppointmentToday(appointment.appointment_date_time) 
                        ? 'bg-muted-50/30' 
                        : isAppointmentPast(appointment.appointment_date_time)
                        ? 'opacity-60'
                        : ''
                    }`}
                    onClick={() => onRowClick(appointment)}
                  >
                    <TableCell className="font-medium">
                      {appointment.patient?.full_name || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {appointment.patient?.whatsapp_number || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatAppointmentDate(appointment.appointment_date_time)}
                        </span>
                        {isAppointmentToday(appointment.appointment_date_time) && (
                          <span className="text-xs text-yellow-600 font-semibold">
                            Hari ini
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {appointment.reason_for_visit || '-'}
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
                          <SelectItem value="BOOKED">BOOKED</SelectItem>
                          <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                          <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                          <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                          <SelectItem value="NO_SHOW">NO SHOW</SelectItem>
                          <SelectItem value="RESCHEDULED">RESCHEDULED</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs">
                      {appointment.google_calendar_event_id 
                        ? '✓ Synced' 
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls - Di dalam CardContent */}
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
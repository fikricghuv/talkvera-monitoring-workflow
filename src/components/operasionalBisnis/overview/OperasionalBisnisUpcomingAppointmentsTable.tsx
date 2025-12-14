// src/components/operasionalBisnis/overview/OperasionalBisnisUpcomingAppointmentsTable.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AppointmentWithContact } from '@/types/operasionalBisnisToolUsage';
import { 
  getAppointmentStatusColor,
  getSourceBadgeColor,
  formatDateTime,
  truncateText
} from '@/utils/operasionalBisnisToolUsageUtils';

interface Props {
  data: AppointmentWithContact[];
}

export const OperasionalBisnisUpcomingAppointmentsTable: React.FC<Props> = ({ data }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Appointment Time</TableHead>
              <TableHead>Contact Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-center">Source</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Tidak ada appointments tersedia
                </TableCell>
              </TableRow>
            ) : (
              data.map((appointment, index) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatDateTime(appointment.appointment_start)}
                    {appointment.appointment_end && (
                      <div className="text-xs text-muted-foreground">
                        s/d {formatDateTime(appointment.appointment_end)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {appointment.contact_name || '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{appointment.contact_email || '-'}</div>
                    {appointment.contact_phone && (
                      <div className="text-xs text-muted-foreground">
                        {appointment.contact_phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {appointment.reason ? truncateText(appointment.reason, 40) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getSourceBadgeColor(appointment.source)}>
                      {appointment.source === 'landing_page' ? 'LP' : 
                       appointment.source === 'whatsapp' ? 'WA' : 'Manual'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getAppointmentStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
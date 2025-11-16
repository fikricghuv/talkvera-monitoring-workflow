// components/overview/RecentActivityTable.tsx

import React from "react";
import { Loader2, Phone } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SessionStatusBadge } from "./SessionStatusBadge";
import { RecentSession } from "../../types/chatbotOverview";
import { formatDateTime, getRelativeTime } from "../../utils/chatbotOverviewUtils";

interface RecentActivityTableProps {
  sessions: RecentSession[];
  isLoading: boolean;
}

/**
 * Table component untuk menampilkan recent activity sessions
 */
export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({
  sessions,
  isLoading,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Memuat aktivitas terbaru...</span>
      </div>
    );
  }

  // Empty state
  if (sessions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Belum ada aktivitas chat
      </div>
    );
  }

  // Data state
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Pasien</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pesan</TableHead>
            <TableHead>Waktu Mulai</TableHead>
            <TableHead>Step Terakhir</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                {session.patient_name || <span className="text-muted-foreground italic">Belum diisi</span>}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm">{session.whatsapp_number}</span>
                </div>
              </TableCell>
              <TableCell>
                <SessionStatusBadge status={session.status} />
              </TableCell>
              <TableCell>
                <span className="font-semibold">{session.total_messages}</span>
                <span className="text-muted-foreground text-sm ml-1">pesan</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">{formatDateTime(session.start_time)}</span>
                  <span className="text-xs text-muted-foreground">{getRelativeTime(session.start_time)}</span>
                </div>
              </TableCell>
              <TableCell>
                {session.final_step_reached ? (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {session.final_step_reached}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs italic">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
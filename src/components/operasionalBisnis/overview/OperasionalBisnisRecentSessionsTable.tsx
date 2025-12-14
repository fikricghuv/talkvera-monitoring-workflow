// src/components/operasionalBisnis/overview/OperasionalBisnisRecentSessionsTable.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { SessionWithContact } from '@/types/operasionalBisnisToolUsage';
import { 
  getSessionStatusColor,
  getSourceBadgeColor,
  formatDateTime,
  formatDuration,
  truncateText
} from '@/utils/operasionalBisnisToolUsageUtils';

interface Props {
  data: SessionWithContact[];
}

export const OperasionalBisnisRecentSessionsTable: React.FC<Props> = ({ data }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Recent Chat Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Messages</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead>Sender ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Tidak ada data sessions tersedia
                </TableCell>
              </TableRow>
            ) : (
              data.map((session, index) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="text-sm">
                    {formatDateTime(session.start_time)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getSourceBadgeColor(session.source)}>
                      {session.source === 'landing_page' ? 'LP' : 'WA'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {session.contact_name || session.contact_email || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getSessionStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{session.total_messages}</TableCell>
                  <TableCell className="text-right text-sm">
                    {session.duration_minutes ? formatDuration(session.duration_minutes) : 'Ongoing'}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {truncateText(session.sender_id, 20)}
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
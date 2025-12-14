// src/components/operasionalBisnis/overview/OperasionalBisnisTopContactsTable.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { TopContact } from '@/types/operasionalBisnisToolUsage';
import { 
  getLifecycleStageColor, 
  formatDateTime,
  truncateText 
} from '@/utils/operasionalBisnisToolUsageUtils';

interface Props {
  data: TopContact[];
}

export const OperasionalBisnisTopContactsTable: React.FC<Props> = ({ data }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Top 10 Contacts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-center">Lifecycle</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Sessions</TableHead>
              <TableHead className="text-right">Appointments</TableHead>
              <TableHead>Last Interaction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  Tidak ada data contacts tersedia
                </TableCell>
              </TableRow>
            ) : (
              data.map((contact, index) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {contact.full_name || '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {contact.email ? truncateText(contact.email, 30) : '-'}
                  </TableCell>
                  <TableCell className="text-sm">{contact.phone || '-'}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={getLifecycleStageColor(contact.lifecycle_stage)}>
                      {contact.lifecycle_stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {contact.lead_score}
                  </TableCell>
                  <TableCell className="text-right">{contact.total_sessions}</TableCell>
                  <TableCell className="text-right">{contact.total_appointments}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(contact.last_interaction_at)}
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
// src/components/OperasionalBisnisToolUsage/OperasionalBisnisTopUsersTable.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { TopUser } from '@/types/operasionalBisnisToolUsage';

interface OperasionalBisnisTopUsersTableProps {
  data: TopUser[];
}

export const OperasionalBisnisTopUsersTable: React.FC<OperasionalBisnisTopUsersTableProps> = ({ data }) => {
  const getSuccessRateBadge = (rate: number) => {
    if (rate >= 90) return <Badge className="bg-green-500">Excellent</Badge>;
    if (rate >= 70) return <Badge className="bg-yellow-500">Good</Badge>;
    return <Badge className="bg-red-500">Poor</Badge>;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Top 10 Most Active Users</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>User Name</TableHead>
              <TableHead className="text-right">Execution Count</TableHead>
              <TableHead className="text-right">Success Rate</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Tidak ada data tersedia
                </TableCell>
              </TableRow>
            ) : (
              data.map((user, index) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{user.user_id}</TableCell>
                  <TableCell>{user.user_name || '-'}</TableCell>
                  <TableCell className="text-right">{user.execution_count}</TableCell>
                  <TableCell className="text-right">{user.success_rate.toFixed(1)}%</TableCell>
                  <TableCell className="text-center">
                    {getSuccessRateBadge(user.success_rate)}
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
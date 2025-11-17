// src/components/AgentTopUsersTable.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import type { AgentTopUser } from '@/types/dataAgentOverview';
import { formatNumber, formatPercentage } from '@/utils/dataAgentUtils';

interface AgentTopUsersTableProps {
  data: AgentTopUser[];
}

/**
 * Top users table
 */
export const AgentTopUsersTable: React.FC<AgentTopUsersTableProps> = ({ data }) => {
  const getRankIcon = (index: number) => {
    const colors = ['text-yellow-500', 'text-gray-400', 'text-orange-600'];
    return (
      <Trophy className={`h-4 w-4 ${colors[index] || 'text-gray-300'}`} />
    );
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top 5 Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data user
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead className="text-right">Queries</TableHead>
                  <TableHead className="text-right">Success Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((user, idx) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="text-center">
                      {getRankIcon(idx)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {user.user_id}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(user.query_count)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={user.success_rate >= 80 ? "default" : "secondary"}
                        className={user.success_rate >= 80 ? "bg-green-500 text-white hover:bg-green-600" : ""}
                      >
                        {formatPercentage(user.success_rate)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
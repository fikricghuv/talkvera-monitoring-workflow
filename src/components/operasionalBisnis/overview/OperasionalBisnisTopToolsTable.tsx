// src/components/OperasionalBisnisToolUsage/OperasionalBisnisTopToolsTable.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { TopTool } from '@/types/operasionalBisnisToolUsage';

interface OperasionalBisnisTopToolsTableProps {
  data: TopTool[];
}

export const OperasionalBisnisTopToolsTable: React.FC<OperasionalBisnisTopToolsTableProps> = ({ data }) => {
  const getSuccessRateBadge = (rate: number) => {
    if (rate >= 90) return <Badge className="bg-green-500">Excellent</Badge>;
    if (rate >= 70) return <Badge className="bg-yellow-500">Good</Badge>;
    return <Badge className="bg-red-500">Poor</Badge>;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Top 10 Most Used Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Tool Name</TableHead>
              <TableHead className="text-right">Usage Count</TableHead>
              <TableHead className="text-right">Success Rate</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Tidak ada data tersedia
                </TableCell>
              </TableRow>
            ) : (
              data.map((tool, index) => (
                <TableRow key={tool.tool_name}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{tool.tool_name}</TableCell>
                  <TableCell className="text-right">{tool.usage_count}</TableCell>
                  <TableCell className="text-right">{tool.success_rate.toFixed(1)}%</TableCell>
                  <TableCell className="text-center">
                    {getSuccessRateBadge(tool.success_rate)}
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
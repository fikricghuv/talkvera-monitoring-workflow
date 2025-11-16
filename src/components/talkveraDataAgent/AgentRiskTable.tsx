// src/components/AgentRiskTable.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AgentRiskDistribution } from '@/types/dataAgent';
import { RISK_TYPE_LABELS, SEVERITY_LABELS } from '@/constants/dataAgent';

interface AgentRiskTableProps {
  data: AgentRiskDistribution[];
}

/**
 * Risk distribution table
 */
export const AgentRiskTable: React.FC<AgentRiskTableProps> = ({ data }) => {
  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive',
    };

    const classes: Record<string, string> = {
      low: 'bg-green-500 text-white hover:bg-green-600',
      medium: 'bg-yellow-500 text-black hover:bg-yellow-600',
      high: '',
    };

    return (
      <Badge variant={variants[severity] || 'outline'} className={classes[severity] || ''}>
        {SEVERITY_LABELS[severity] || severity}
      </Badge>
    );
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Risk Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada risk terdeteksi
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Risk Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((risk, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      {RISK_TYPE_LABELS[risk.risk_type] || risk.risk_type}
                    </TableCell>
                    <TableCell>
                      {getSeverityBadge(risk.severity)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {risk.count}
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
// src/components/talkveraDataAgent/AgentMonitoringTable.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Download, RefreshCw, Database, FileText, AlertTriangle } from "lucide-react";
import type { QueryWithDetails } from "@/types/agentMonitoring";
import { PaginationControls } from "@/components/PaginationControls";
import {
  getMethodLabel,
  getMethodBadgeClass,
  truncateText,
  formatTableDate,
} from "@/utils/agentMonitoringUtils";
import { formatResponseTime } from "@/utils/dataAgentUtils";
import { TABLE_COLUMNS, MONITORING_MESSAGES } from "@/constants/agentMonitoring";

interface AgentMonitoringTableProps {
  queries: QueryWithDetails[];
  totalCount: number;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  hasFilters: boolean;
  onRowClick: (query: QueryWithDetails) => void;
  onRefresh: () => void;
  onDownload: () => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
}

/**
 * Main table component for query monitoring
 */
export const AgentMonitoringTable: React.FC<AgentMonitoringTableProps> = ({
  queries,
  totalCount,
  isLoading,
  currentPage,
  itemsPerPage,
  totalPages,
  hasFilters,
  onRowClick,
  onRefresh,
  onDownload,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);
  const showNoDataMessage = !isLoading && queries.length === 0;

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Query List ({totalCount})</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Menampilkan {totalCount > 0 ? startIndex + 1 : 0}-{endIndex} dari {totalCount} queries
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onRefresh} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={onDownload}
            variant="default"
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            disabled={totalCount === 0 || isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px]">{TABLE_COLUMNS.QUESTION}</TableHead>
                <TableHead>{TABLE_COLUMNS.USER}</TableHead>
                <TableHead>{TABLE_COLUMNS.STATUS}</TableHead>
                <TableHead>{TABLE_COLUMNS.METHOD}</TableHead>
                <TableHead>{TABLE_COLUMNS.RESPONSE_TIME}</TableHead>
                <TableHead>{TABLE_COLUMNS.RISKS}</TableHead>
                <TableHead>{TABLE_COLUMNS.CREATED_AT}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground mt-2">Memuat data...</p>
                  </TableCell>
                </TableRow>
              ) : showNoDataMessage ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Database className="h-12 w-12 text-muted-foreground/40" />
                      <p className="font-medium">
                        {hasFilters ? MONITORING_MESSAGES.NO_FILTERED_DATA : MONITORING_MESSAGES.NO_DATA}
                      </p>
                      {hasFilters && (
                        <p className="text-xs">Coba sesuaikan filter atau pencarian Anda</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                queries.map((query) => (
                  <TableRow
                    key={query.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onRowClick(query)}
                  >
                    {/* Question */}
                    <TableCell className="font-medium">
                      <div className="max-w-[300px]">
                        <p className="line-clamp-2 text-sm">{truncateText(query.question, 100)}</p>
                      </div>
                    </TableCell>

                    {/* User */}
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {query.user_id}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        variant={query.is_success ? "default" : "destructive"}
                        className={query.is_success ? "bg-green-500 text-white hover:bg-green-600" : ""}
                      >
                        {query.is_success ? "Success" : "Failed"}
                      </Badge>
                    </TableCell>

                    {/* Method */}
                    <TableCell>
                      <Badge variant="outline" className={getMethodBadgeClass(query.used_sql, query.used_rag)}>
                        <div className="flex items-center gap-1">
                          {query.used_sql && <Database className="h-3 w-3" />}
                          {query.used_rag && <FileText className="h-3 w-3" />}
                          <span>{getMethodLabel(query.used_sql, query.used_rag)}</span>
                        </div>
                      </Badge>
                    </TableCell>

                    {/* Response Time */}
                    <TableCell className="font-mono text-sm">
                      {formatResponseTime(query.response_time_ms)}
                    </TableCell>

                    {/* Risks */}
                    <TableCell>
                      {query.risk_logs.length > 0 ? (
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{query.risk_logs.length}</span>
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>

                    {/* Created At */}
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTableDate(query.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
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
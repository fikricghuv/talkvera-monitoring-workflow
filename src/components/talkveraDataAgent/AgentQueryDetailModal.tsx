// src/components/AgentQueryDetailModal.tsx

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Database, FileText, Shield, CheckCircle2, XCircle } from "lucide-react";
import type { QueryWithDetails } from "@/types/agentMonitoring";
import { getMethodLabel, formatDetailDate } from "@/utils/agentMonitoringUtils";
import { formatResponseTime } from "@/utils/dataAgentUtils";
import { RISK_TYPE_LABELS, SEVERITY_LABELS } from "@/constants/dataAgent";

interface AgentQueryDetailModalProps {
  query: QueryWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Detail modal component for query details
 */
export const AgentQueryDetailModal: React.FC<AgentQueryDetailModalProps> = ({
  query,
  isOpen,
  onClose,
}) => {
  if (!query) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Query Detail
            <Badge
              variant={query.is_success ? "default" : "destructive"}
              className={query.is_success ? "bg-green-500 text-white hover:bg-green-600" : ""}
            >
              {query.is_success ? "Success" : "Failed"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap dari query dan logs terkait
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Query Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Query Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Query ID</p>
                    <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{query.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User ID</p>
                    <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{query.user_id}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Question</p>
                  <div className="bg-muted p-3 rounded text-sm">
                    {query.question}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Agent Response</p>
                  <div className="bg-muted p-3 rounded text-sm max-h-32 overflow-y-auto">
                    {query.agent_response || '-'}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                    <p className="text-base font-mono">{formatResponseTime(query.response_time_ms)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Method Used</p>
                    <p className="text-base">{getMethodLabel(query.used_sql, query.used_rag)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created At</p>
                    <p className="text-sm">{formatDetailDate(query.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Logs */}
            <Tabs defaultValue="sql" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sql" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  SQL Logs ({query.sql_logs.length})
                </TabsTrigger>
                <TabsTrigger value="rag" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  RAG Logs ({query.rag_logs.length})
                </TabsTrigger>
                <TabsTrigger value="risk" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Risk Logs ({query.risk_logs.length})
                </TabsTrigger>
              </TabsList>

              {/* SQL Logs Tab */}
              <TabsContent value="sql" className="mt-4">
                {query.sql_logs.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Tidak ada SQL logs untuk query ini</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {query.sql_logs.map((log, idx) => (
                      <Card key={log.id}>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            SQL Log #{idx + 1}
                            <Badge
                              variant={log.status === 'success' ? "default" : "destructive"}
                              className={log.status === 'success' ? "bg-green-500 text-white" : ""}
                            >
                              {log.status === 'success' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                              {log.status}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">SQL Query</p>
                            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                              <code>{log.sql_raw}</code>
                            </pre>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Execution Time</p>
                              <p className="text-sm font-mono">{formatResponseTime(log.execution_time_ms)}</p>
                            </div>
                            {log.error_message && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Error</p>
                                <p className="text-sm text-destructive">{log.error_message}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* RAG Logs Tab */}
              <TabsContent value="rag" className="mt-4">
                {query.rag_logs.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Tidak ada RAG logs untuk query ini</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {query.rag_logs.map((log, idx) => (
                      <Card key={log.id}>
                        <CardHeader>
                          <CardTitle className="text-sm">RAG Log #{idx + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {log.vector_query && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">Vector Query</p>
                              <div className="bg-muted p-3 rounded text-sm">
                                {log.vector_query}
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Top K</p>
                              <p className="text-base font-mono">{log.top_k}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Retrieved</p>
                              <p className="text-base font-mono">{log.retrieval_count || 0}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Latency</p>
                              <p className="text-sm font-mono">{formatResponseTime(log.rag_latency_ms)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Risk Logs Tab */}
              <TabsContent value="risk" className="mt-4">
                {query.risk_logs.length === 0 ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Tidak ada risk terdeteksi untuk query ini
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Risk Type</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>Detected At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {query.risk_logs.map((risk) => (
                          <TableRow key={risk.id}>
                            <TableCell className="font-medium">
                              {RISK_TYPE_LABELS[risk.risk_type] || risk.risk_type}
                            </TableCell>
                            <TableCell>
                              {getSeverityBadge(risk.severity)}
                            </TableCell>
                            <TableCell>
                              <pre className="text-xs max-w-md overflow-x-auto">
                                {JSON.stringify(risk.detail, null, 2)}
                              </pre>
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDetailDate(risk.created_at)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
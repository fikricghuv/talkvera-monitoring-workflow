import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NodeExecution } from "@/types/nodeExecution";
import { formatExecutionTime } from "@/utils/nodeExecutionUtils";
import { StatusBadge } from "../StatusBadge";

interface ExecutionDetailModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  node: NodeExecution | null;
}

export const ExecutionDetailModal = ({ isOpen, onClose, node }: ExecutionDetailModalProps) => {
  if (!node) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Detail Node Execution</DialogTitle>
          <DialogDescription>
            Informasi lengkap dari node execution yang dipilih
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 p-2 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
            <DetailItem 
              title="Node Name" 
              value={<span className="font-semibold text-lg text-indigo-700">{node.node_name}</span>} 
            />
            <DetailItem 
              title="Node Type" 
              value={<Badge variant="outline" className="text-sm">{node.node_type || "N/A"}</Badge>} 
            />
            <DetailItem title="Status" value={<StatusBadge status={node.execution_status} />} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-4">
            <DetailItem 
              title="Execution Time" 
              value={<span className="text-lg font-mono text-blue-600">{formatExecutionTime(node.execution_time_ms)}</span>} 
            />
            <DetailItem 
              title="Cost (USD)" 
              value={<span className="text-lg font-mono text-green-700">${Number(node.estimated_cost_usd).toFixed(6)}</span>} 
            />
            <DetailItem 
              title="Total Tokens" 
              value={<span className="text-lg font-mono text-orange-600">{node.total_tokens.toLocaleString()}</span>} 
            />
            <DetailItem 
              title="Finish Reason" 
              value={<span className="text-sm">{node.finish_reason || "N/A"}</span>} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-4">
            <DetailItem 
              title="Prompt Tokens" 
              value={<span className="font-mono">{node.prompt_tokens.toLocaleString()}</span>} 
            />
            <DetailItem 
              title="Completion Tokens" 
              value={<span className="font-mono">{node.completion_tokens.toLocaleString()}</span>} 
            />
            <DetailItem 
              title="Estimated Tokens" 
              value={<span className="font-mono">{node.estimated_tokens?.toLocaleString() || "N/A"}</span>} 
            />
            <DetailItem 
              title="Accuracy" 
              value={
                <span className="font-mono">
                  {node.token_estimation_accuracy 
                    ? `${(node.token_estimation_accuracy * 100).toFixed(1)}%` 
                    : "N/A"}
                </span>
              } 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
            <DetailItem 
              title="Model Name" 
              value={<span className="font-semibold">{node.model_name || "N/A"}</span>} 
            />
            <DetailItem 
              title="Input Items" 
              value={<span className="font-mono">{node.input_items_count}</span>} 
            />
            <DetailItem 
              title="Output Items" 
              value={<span className="font-mono">{node.output_items_count}</span>} 
            />
          </div>

          <div className="space-y-2 border-b pb-4">
            <DetailItem 
              title="Execution ID" 
              value={
                <p className="text-xs font-mono bg-gray-200 p-2 rounded truncate select-all">
                  {node.execution_id}
                </p>
              } 
            />
            <DetailItem
              title="Output Data"
              value={
                <textarea
                  className="text-xs font-mono bg-gray-200 p-2 rounded w-full resize-none overflow-x-hidden whitespace-pre-wrap break-all"
                  value={node.output_data_sample || ""}
                  readOnly
                  rows={1}
                  onChange={() => {}}
                  ref={(el) => {
                    if (!el) return;
                    el.style.height = "auto";
                    el.style.height = `${el.scrollHeight}px`;
                  }}
                />
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
            <DetailItem 
              title="Execution Index" 
              value={<span className="font-mono">{node.execution_index ?? "N/A"}</span>} 
            />
            <DetailItem 
              title="Sub Run Index" 
              value={<span className="font-mono">{node.sub_run_index ?? "N/A"}</span>} 
            />
            <DetailItem 
              title="Parent Node" 
              value={<span className="text-sm">{node.parent_node_name || "None"}</span>} 
            />
          </div>

          {node.output_summary && (
            <div className="border-b pb-4">
              <DetailItem 
                title="Output Model AI" 
                value={
                  <p className="text-sm bg-blue-50 p-3 rounded border border-blue-200">
                    {node.output_summary}
                  </p>
                } 
              />
            </div>
          )}

          {node.has_error && (
            <Alert variant="destructive" className="border-red-500 bg-red-50/50">
              <AlertCircle className="h-4 w-4 text-red-700" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-bold text-red-700">
                    Error Name: {node.error_name || "Unknown"}
                  </p>
                  {node.error_message && (
                    <>
                      <p className="font-semibold text-red-700">Message:</p>
                      <pre className="text-sm bg-red-100 p-3 rounded whitespace-pre-wrap break-all border border-red-300 text-red-800">
                        {node.error_message}
                      </pre>
                    </>
                  )}
                  {node.error_stack && (
                    <>
                      <p className="font-semibold text-red-700 mt-2">Stack Trace:</p>
                      <pre className="text-xs bg-red-100 p-3 rounded whitespace-pre-wrap break-all border border-red-300 text-red-800 max-h-40 overflow-y-auto">
                        {node.error_stack}
                      </pre>
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailItem 
              title="Start Time" 
              value={
                <span className="text-sm">
                  {node.start_time 
                    ? new Date(node.start_time).toLocaleString('id-ID')
                    : "N/A"}
                </span>
              } 
            />
            <DetailItem 
              title="Inserted At" 
              value={
                <span className="text-sm">
                  {new Date(node.inserted_at).toLocaleString('id-ID')}
                </span>
              } 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DetailItem = ({ title, value }: { title: string; value: React.ReactNode }) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-muted-foreground">{title}</p>
    {value}
  </div>
);
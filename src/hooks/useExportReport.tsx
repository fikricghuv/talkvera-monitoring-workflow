import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NodeExecution, RawNodeExecution, FilterState } from "@/types/nodeExecution";

export const useExportReport = (
  buildQuery: (baseQuery: any, includeFilters?: boolean) => any,
  processRawData: (rawData: RawNodeExecution[]) => NodeExecution[]
) => {
  const downloadReport = async (filters: FilterState) => {
    toast.info("Memproses download report...");
    
    try {
      let query = supabase.from("dt_node_executions").select("*");
      query = buildQuery(query);

      const { data, error } = await query
        .order("inserted_at", { ascending: false })
        .limit(1000);

      if (error) throw error;

      const rawData = (data as unknown) as RawNodeExecution[] | null;
      const processedData = processRawData(rawData || []);

      const headers = [
        'Execution ID', 'Node Name', 'Node Type', 'Model', 'Status',
        'Execution Time (ms)', 'Prompt Tokens', 'Completion Tokens', 
        'Total Tokens', 'Cost (USD)', 'Input Items', 'Output Items',
        'Has Error', 'Error Message', 'Finish Reason', 'Created At'
      ];

      const rows = processedData.map(node => [
        node.execution_id,
        node.node_name,
        node.node_type || 'N/A',
        node.model_name || '-',
        node.execution_status || 'Unknown',
        node.execution_time_ms || 0,
        node.prompt_tokens,
        node.completion_tokens,
        node.total_tokens,
        Number(node.estimated_cost_usd).toFixed(6),
        node.input_items_count,
        node.output_items_count,
        node.has_error ? 'Yes' : 'No',
        (node.error_message || '-').replace(/"/g, '""'),
        node.finish_reason || 'N/A',
        new Date(node.inserted_at).toLocaleString('id-ID'),
      ]);

      const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `execution-log-report_${timestamp}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Report berhasil didownload!");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Gagal mendownload report");
    }
  };

  return { downloadReport };
};
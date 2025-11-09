-- Create node executions table
CREATE TABLE IF NOT EXISTS public.dt_node_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES public.dt_workflow_executions(execution_id) ON DELETE CASCADE,
  node_name TEXT NOT NULL,
  node_type TEXT NOT NULL,
  execution_status TEXT NOT NULL CHECK (execution_status IN ('success', 'error', 'skipped')),
  execution_time_ms INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd DECIMAL(10, 6) NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  has_error BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dt_node_executions ENABLE ROW LEVEL SECURITY;

-- Create policy for read access
CREATE POLICY "Allow public read access to node executions"
ON public.dt_node_executions
FOR SELECT
USING (true);

-- Create policy for insert
CREATE POLICY "Allow insert for node executions"
ON public.dt_node_executions
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_node_executions_execution_id ON public.dt_node_executions(execution_id);
CREATE INDEX idx_node_executions_status ON public.dt_node_executions(execution_status);

-- Create execution process queue table
CREATE TABLE IF NOT EXISTS public.dt_execution_process_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'processing', 'completed', 'failed')),
  priority INTEGER NOT NULL DEFAULT 0,
  workflow_to_process TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dt_execution_process_queue ENABLE ROW LEVEL SECURITY;

-- Create policy for read access
CREATE POLICY "Allow public read access to process queue"
ON public.dt_execution_process_queue
FOR SELECT
USING (true);

-- Create policy for insert
CREATE POLICY "Allow insert for process queue"
ON public.dt_execution_process_queue
FOR INSERT
WITH CHECK (true);

-- Create policy for update
CREATE POLICY "Allow update for process queue"
ON public.dt_execution_process_queue
FOR UPDATE
USING (true);

-- Create index for faster queries
CREATE INDEX idx_process_queue_status ON public.dt_execution_process_queue(status);
CREATE INDEX idx_process_queue_priority ON public.dt_execution_process_queue(priority DESC);
CREATE INDEX idx_process_queue_created_at ON public.dt_execution_process_queue(created_at DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_process_queue_updated_at
BEFORE UPDATE ON public.dt_execution_process_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create workflow executions table
CREATE TABLE IF NOT EXISTS public.dt_workflow_executions (
  execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'running', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_execution_time_ms INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd DECIMAL(10, 4) NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  has_errors BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.dt_workflow_executions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read (for monitoring purposes)
CREATE POLICY "Allow public read access to workflow executions"
ON public.dt_workflow_executions
FOR SELECT
USING (true);

-- Create policy to allow insert for system/admin
CREATE POLICY "Allow insert for workflow executions"
ON public.dt_workflow_executions
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_workflow_executions_created_at ON public.dt_workflow_executions(created_at DESC);
CREATE INDEX idx_workflow_executions_status ON public.dt_workflow_executions(status);
CREATE INDEX idx_workflow_executions_has_errors ON public.dt_workflow_executions(has_errors);
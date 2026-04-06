CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT[] DEFAULT '{}',
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  due_date DATE,
  completed_date DATE,
  created_by TEXT DEFAULT 'Christian',
  created_by_type TEXT DEFAULT 'admin',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access tasks" ON project_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX idx_project_tasks_status ON project_tasks(status);

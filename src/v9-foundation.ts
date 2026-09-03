export type V9JobPriority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type V9WorkflowStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Blocked';

export interface V9OperationalSnapshot {
  jobId: string;
  teamId?: string;
  priority: V9JobPriority;
  status: V9WorkflowStatus;
  scheduledDate?: string;
  notes?: string;
}

export function summarizeV9Operations(items: V9OperationalSnapshot[]) {
  return {
    total: items.length,
    scheduled: items.filter((item) => item.status === 'Scheduled').length,
    inProgress: items.filter((item) => item.status === 'In Progress').length,
    completed: items.filter((item) => item.status === 'Completed').length,
    blocked: items.filter((item) => item.status === 'Blocked').length,
    urgent: items.filter((item) => item.priority === 'Urgent').length,
  };
}

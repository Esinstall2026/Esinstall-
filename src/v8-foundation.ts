export type V8JobPriority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type V8WorkflowStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Blocked';

export interface V8WorkflowItem {
  id: string;
  jobId: string;
  teamId?: string;
  priority: V8JobPriority;
  status: V8WorkflowStatus;
  scheduledDate?: string;
  notes?: string;
}

/** V8 foundation: shared workflow state for the next integration layer. */
export function getWorkflowSummary(items: V8WorkflowItem[]) {
  return {
    total: items.length,
    scheduled: items.filter((item) => item.status === 'Scheduled').length,
    inProgress: items.filter((item) => item.status === 'In Progress').length,
    completed: items.filter((item) => item.status === 'Completed').length,
    blocked: items.filter((item) => item.status === 'Blocked').length,
    urgent: items.filter((item) => item.priority === 'Urgent').length,
  };
}

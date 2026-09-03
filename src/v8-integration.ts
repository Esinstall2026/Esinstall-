import type { Job, JobStatus } from './types';
import type { V8JobPriority, V8WorkflowItem, V8WorkflowStatus } from './v8-foundation';

const statusMap: Record<JobStatus, V8WorkflowStatus> = {
  Scheduled: 'Scheduled',
  Production: 'In Progress',
  'Ready for Installation': 'Scheduled',
  Installation: 'In Progress',
  Completed: 'Completed',
  Warranty: 'Blocked',
};

export function createWorkflowItem(input: Omit<V8WorkflowItem, 'id'> & { id?: string }): V8WorkflowItem {
  return {
    ...input,
    id: input.id ?? `WF-${Date.now()}`,
  };
}

export function assignWorkflowItem(item: V8WorkflowItem, teamId: string): V8WorkflowItem {
  return { ...item, teamId };
}

export function transitionWorkflow(item: V8WorkflowItem, status: V8WorkflowStatus): V8WorkflowItem {
  return { ...item, status };
}

export function prioritizeWorkflow(item: V8WorkflowItem, priority: V8JobPriority): V8WorkflowItem {
  return { ...item, priority };
}

/** Convert an existing ES INSTALL Job into the shared V8 workflow model. */
export function jobToWorkflowItem(job: Job, existing?: V8WorkflowItem): V8WorkflowItem {
  return {
    id: existing?.id ?? `WF-${job.id}`,
    jobId: job.id,
    teamId: existing?.teamId ?? job.team,
    priority: existing?.priority ?? 'Normal',
    status: statusMap[job.status],
    scheduledDate: existing?.scheduledDate ?? job.date,
    notes: existing?.notes ?? '',
  };
}

/** Keep a workflow item synchronized with the current Job record. */
export function syncWorkflowItem(item: V8WorkflowItem, job: Job): V8WorkflowItem {
  return jobToWorkflowItem(job, item);
}

/** Lightweight integrity check used before promoting V8 to the next version. */
export function validateWorkflowItem(item: V8WorkflowItem): string[] {
  const errors: string[] = [];
  if (!item.id) errors.push('Workflow ID is required');
  if (!item.jobId) errors.push('Job ID is required');
  if (!item.teamId) errors.push('Team assignment is required');
  if (!item.priority) errors.push('Priority is required');
  if (!item.status) errors.push('Workflow status is required');
  return errors;
}

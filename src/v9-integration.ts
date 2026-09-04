import type { Job } from './types';
import type { V8WorkflowItem } from './v8-foundation';
import { jobToWorkflowItem } from './v8-integration';

export interface V9WorkflowBoard {
  scheduled: V8WorkflowItem[];
  inProgress: V8WorkflowItem[];
  completed: V8WorkflowItem[];
  blocked: V8WorkflowItem[];
}

export interface V9DashboardSummary {
  totalJobs: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  blocked: number;
  teamsAssigned: number;
  urgent: number;
}

/** Build the V9 operational board from the existing Job records. */
export function buildWorkflowBoard(jobs: Job[], existing: V8WorkflowItem[] = []): V9WorkflowBoard {
  const items = jobs.map((job) => {
    const current = existing.find((item) => item.jobId === job.id);
    return jobToWorkflowItem(job, current);
  });

  return {
    scheduled: items.filter((item) => item.status === 'Scheduled'),
    inProgress: items.filter((item) => item.status === 'In Progress'),
    completed: items.filter((item) => item.status === 'Completed'),
    blocked: items.filter((item) => item.status === 'Blocked'),
  };
}

/** Produce the KPI set consumed by the V9 Dashboard integration. */
export function buildDashboardSummary(jobs: Job[], existing: V8WorkflowItem[] = []): V9DashboardSummary {
  const items = jobs.map((job) => jobToWorkflowItem(job, existing.find((item) => item.jobId === job.id)));

  return {
    totalJobs: items.length,
    scheduled: items.filter((item) => item.status === 'Scheduled').length,
    inProgress: items.filter((item) => item.status === 'In Progress').length,
    completed: items.filter((item) => item.status === 'Completed').length,
    blocked: items.filter((item) => item.status === 'Blocked').length,
    teamsAssigned: new Set(items.map((item) => item.teamId).filter(Boolean)).size,
    urgent: items.filter((item) => item.priority === 'Urgent').length,
  };
}

/** Return the next operational jobs first, while keeping blocked work visible. */
export function prioritizeOperationalJobs(jobs: Job[], existing: V8WorkflowItem[] = []): V8WorkflowItem[] {
  const items = jobs.map((job) => jobToWorkflowItem(job, existing.find((item) => item.jobId === job.id)));
  const rank = { Urgent: 0, High: 1, Normal: 2, Low: 3 } as const;

  return [...items].sort((a, b) => {
    const priority = rank[a.priority] - rank[b.priority];
    if (priority !== 0) return priority;
    return (a.scheduledDate ?? '').localeCompare(b.scheduledDate ?? '');
  });
}
